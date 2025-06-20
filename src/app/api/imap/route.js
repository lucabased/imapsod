import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ImapConfig from '@/models/ImapConfig';
import dns from 'dns/promises';

function getRootDomain(domain) {
    const parts = domain.split('.');
    if (parts.length > 2) {
        // Handle common TLDs like .co.uk
        if (parts.length > 2 && ['co', 'com', 'org', 'net'].includes(parts[parts.length - 2])) {
            return parts.slice(-3).join('.');
        }
        return parts.slice(-2).join('.');
    }
    return domain;
}

async function findImapConfig(domain) {
    // 1. Check database
    const rootDomain = getRootDomain(domain);
    let config = await ImapConfig.findOne({ domain: rootDomain });
    if (config) {
        return config;
    }

    // 2. DNS lookup
    try {
        const srvRecords = await dns.resolveSrv(`_imap._tcp.${rootDomain}`);
        if (srvRecords.length > 0) {
            const { name, port } = srvRecords[0];
            // Assuming TLS is preferred
            config = {
                domain,
                imap_server: name,
                imap_port: port,
                imap_tls: true,
            };
            // Save to DB for future use
            const newConfig = new ImapConfig({ ...config, domain: rootDomain });
            await newConfig.save();
            return config;
        }
    } catch (error) {
        console.error(`SRV lookup failed for ${rootDomain}:`, error);
        return { error: `SRV lookup failed for ${rootDomain}: ${error.message}` };
    }

    // 3. Common subdomains
    const commonSubdomains = ['imap.', 'mail.', ''];
    for (const sub of commonSubdomains) {
        const host = `${sub}${domain}`;
        try {
            await dns.lookup(host);
            // Found a potential server, but need to check port/tls
            // This part is tricky without a library, for now, we'll just return the host
            // and let the user confirm the settings.
            return {
                imap_server: host,
                // Common ports
                imap_port: 993,
                imap_tls: true,
            };
        } catch (error) {
            // continue
        }
    }

    return null;
}


export async function POST(request) {
    await dbConnect();
    const { email } = await request.json();
    const domain = email.split('@')[1];

    if (!domain) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    try {
        const result = await findImapConfig(domain);

        if (result && !result.error) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result?.error || 'IMAP server not found' }, { status: 404 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

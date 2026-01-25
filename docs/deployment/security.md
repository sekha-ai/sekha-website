# Security Best Practices

## Overview

Sekha handles sensitive conversational data. This guide covers production-grade security hardening.

**Security Principles:**

1. **Defense in Depth** - Multiple layers of security
2. **Least Privilege** - Minimal permissions
3. **Zero Trust** - Verify everything
4. **Data Sovereignty** - You own your data

---

## Threat Model

### Threats We Protect Against

| Threat | Mitigation |
|--------|------------|
| **Unauthorized API access** | API key authentication, rate limiting |
| **Man-in-the-middle attacks** | TLS 1.3, HSTS headers |
| **Data exfiltration** | Encryption at rest, network isolation |
| **Injection attacks** | Prepared statements, input validation |
| **Brute force attacks** | Fail2Ban, rate limiting |
| **Denial of service** | Rate limiting, resource quotas |
| **Insider threats** | Audit logs, access controls |

---

## API Key Security

### Generation

**Generate cryptographically secure keys:**

```bash
# 32-byte random key (256 bits)
openssl rand -base64 32

# Or hex format
openssl rand -hex 32

# Or Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Minimum requirements:**

- Length: 32+ characters
- Entropy: 256+ bits
- Character set: Alphanumeric + symbols

❌ **NEVER USE:**
- `dev-key-replace-in-production` (default development key)
- Dictionary words
- Predictable patterns
- Keys from examples/documentation

### Storage

**Environment variables (most secure):**

```bash
# .env file (never commit to git!)
SEKHA_API_KEY="your-secure-key-here"

# Load in docker-compose
services:
  sekha:
    env_file: .env
```

**Configuration file (secure permissions):**

```bash
# Lock down config file
chmod 600 /etc/sekha/config.toml
chown sekha:sekha /etc/sekha/config.toml

# Verify permissions
ls -la /etc/sekha/config.toml
# -rw------- 1 sekha sekha ... config.toml
```

**Secrets management (enterprise):**

- **HashiCorp Vault:** Centralized secrets
- **AWS Secrets Manager:** Cloud-native
- **Kubernetes Secrets:** For K8s deployments

### Rotation

**Rotate keys quarterly:**

```bash
#!/bin/bash
# /usr/local/bin/sekha-rotate-key.sh

OLD_KEY=$(grep 'api_key' /etc/sekha/config.toml | cut -d'"' -f2)
NEW_KEY=$(openssl rand -base64 32)

# Update config
sed -i "s/$OLD_KEY/$NEW_KEY/" /etc/sekha/config.toml

# Restart service
systemctl restart sekha

# Log rotation
logger "Sekha API key rotated at $(date)"

# Notify admin
echo "New API key: $NEW_KEY" | mail -s "Sekha Key Rotation" admin@example.com
```

**Cron job (quarterly rotation):**

```bash
# First day of every quarter at 2 AM
0 2 1 1,4,7,10 * /usr/local/bin/sekha-rotate-key.sh
```

---

## Transport Layer Security (TLS)

### TLS Configuration

**Caddy (automatic HTTPS):**

```caddyfile
sekha.yourdomain.com {
    # Automatic HTTPS via Let's Encrypt
    reverse_proxy localhost:8080

    # Force TLS 1.3
    tls {
        protocols tls1.3
        curves x25519 secp384r1
    }

    # HSTS (force HTTPS for 1 year)
    header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
}
```

**Nginx (manual certificate):**

```nginx
server {
    listen 443 ssl http2;
    server_name sekha.yourdomain.com;

    # TLS certificates
    ssl_certificate /etc/letsencrypt/live/sekha.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sekha.yourdomain.com/privkey.pem;

    # Strong TLS configuration
    ssl_protocols TLSv1.3;
    ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
    ssl_prefer_server_ciphers off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/sekha.yourdomain.com/chain.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name sekha.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Certificate Management

**Let's Encrypt (free, automated):**

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d sekha.yourdomain.com

# Auto-renewal (runs twice daily)
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

**Monitor expiration:**

```bash
# Check certificate validity
echo | openssl s_client -connect sekha.yourdomain.com:443 2>/dev/null | \
  openssl x509 -noout -dates
```

---

## Network Security

### Firewall Configuration

**UFW (Ubuntu/Debian):**

```bash
# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH (change from default port 22!)
sudo ufw allow 2222/tcp comment 'SSH'

# HTTP/HTTPS (reverse proxy only)
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
sudo ufw enable

# Verify rules
sudo ufw status verbose
```

**Firewalld (RHEL/CentOS):**

```bash
# Add services
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=2222/tcp

# Remove default SSH
sudo firewall-cmd --permanent --remove-service=ssh

# Apply changes
sudo firewall-cmd --reload
```

### Private Network Deployment

**Best practice:** Run Sekha on private network, expose via reverse proxy

```yaml
# docker-compose.yml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true  # No internet access

services:
  caddy:
    networks:
      - frontend
      - backend

  sekha-controller:
    networks:
      - backend  # Not exposed to internet
```

### IP Whitelisting

**Nginx (allow specific IPs only):**

```nginx
location /api {
    # Allow office IP
    allow 203.0.113.0/24;
    
    # Allow VPN IP range
    allow 10.0.0.0/8;
    
    # Deny all others
    deny all;
    
    proxy_pass http://localhost:8080;
}
```

**Caddy (rate limit by IP):**

```caddyfile
sekha.yourdomain.com {
    @blocked {
        not remote_ip 203.0.113.0/24 10.0.0.0/8
    }
    
    respond @blocked 403
    
    reverse_proxy localhost:8080
}
```

---

## Data Encryption

### Encryption at Rest

**Full disk encryption (LUKS):**

```bash
# Encrypt data partition
sudo cryptsetup luksFormat /dev/sdb1
sudo cryptsetup open /dev/sdb1 sekha_data
sudo mkfs.ext4 /dev/mapper/sekha_data

# Mount encrypted volume
sudo mkdir /data
sudo mount /dev/mapper/sekha_data /data

# Auto-mount at boot (requires keyfile or passphrase)
echo "sekha_data /dev/sdb1 none" | sudo tee -a /etc/crypttab
echo "/dev/mapper/sekha_data /data ext4 defaults 0 2" | sudo tee -a /etc/fstab
```

**Database encryption (SQLite):**

```bash
# Use SQLCipher (encrypted SQLite)
sudo apt-get install sqlcipher

# Encrypt existing database
sqlcipher sekha.db
sqlite> ATTACH DATABASE 'encrypted.db' AS encrypted KEY 'your-encryption-key';
sqlite> SELECT sqlcipher_export('encrypted');
sqlite> DETACH DATABASE encrypted;
```

**Configuration in Sekha:**

```toml
[database]
path = "/data/sekha_encrypted.db"
encryption_key = "${SEKHA_DB_ENCRYPTION_KEY}"  # From environment
```

### Backup Encryption

**Encrypt backups with GPG:**

```bash
#!/bin/bash
# /usr/local/bin/sekha-encrypted-backup.sh

BACKUP_DIR="/backups/sekha"
DB_PATH="/var/lib/sekha/sekha.db"
DATE=$(date +%Y%m%d_%H%M%S)
GPG_RECIPIENT="backup@yourdomain.com"

mkdir -p "$BACKUP_DIR"

# Create backup
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/sekha_$DATE.db'"

# Encrypt with GPG
gpg --encrypt --recipient "$GPG_RECIPIENT" \
    --output "$BACKUP_DIR/sekha_$DATE.db.gpg" \
    "$BACKUP_DIR/sekha_$DATE.db"

# Remove unencrypted backup
rm "$BACKUP_DIR/sekha_$DATE.db"

# Upload to cloud (encrypted)
rclone copy "$BACKUP_DIR/sekha_$DATE.db.gpg" s3:backups/sekha/

echo "Encrypted backup completed: sekha_$DATE.db.gpg"
```

---

## Access Control

### Role-Based Access (Future Feature)

**Current:** Single API key (full access)

**Roadmap (v2.0):**

```toml
[access_control]
enabled = true

[[access_control.roles]]
name = "admin"
api_key = "admin-key-here"
permissions = ["read", "write", "delete", "manage"]

[[access_control.roles]]
name = "readonly"
api_key = "readonly-key-here"
permissions = ["read"]

[[access_control.roles]]
name = "service"
api_key = "service-key-here"
permissions = ["read", "write"]
rate_limit = 1000  # requests/minute
```

### Audit Logging

**Enable detailed audit logs:**

```toml
[logging]
level = "info"
format = "json"
audit_enabled = true
audit_events = ["auth", "write", "delete"]
```

**Sample audit log:**

```json
{
  "timestamp": "2026-01-25T20:00:00Z",
  "event": "auth",
  "user": "api_key_abc123",
  "ip": "203.0.113.45",
  "action": "login",
  "result": "success"
}
```

**Monitor audit logs:**

```bash
# Failed auth attempts
jq 'select(.event=="auth" and .result=="failure")' /var/log/sekha/audit.log

# Deletions (track data removal)
jq 'select(.action=="delete")' /var/log/sekha/audit.log
```

---

## Intrusion Detection

### Fail2Ban Configuration

**Detect and block brute force attacks:**

```ini
# /etc/fail2ban/filter.d/sekha.conf
[Definition]
failregex = .*"status":401.*"ip":"<HOST>".*
            .*"status":403.*"ip":"<HOST>".*
ignoreregex =

# /etc/fail2ban/jail.d/sekha.conf
[sekha]
enabled = true
port = http,https
filter = sekha
logpath = /var/log/sekha/access.log
maxretry = 5
findtime = 600
bantime = 3600
action = iptables-multiport[name=sekha, port="http,https"]
```

**Restart Fail2Ban:**

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sekha
```

### OSSEC (Host-Based IDS)

**Monitor file integrity and system logs:**

```xml
<!-- /var/ossec/etc/ossec.conf -->
<ossec_config>
  <syscheck>
    <frequency>86400</frequency>
    <directories check_all="yes">/etc/sekha</directories>
    <directories check_all="yes">/var/lib/sekha</directories>
  </syscheck>
  
  <localfile>
    <log_format>syslog</log_format>
    <location>/var/log/sekha/sekha.log</location>
  </localfile>
</ossec_config>
```

---

## Compliance

### GDPR Compliance

**Right to be forgotten:**

```bash
# Delete all conversations for a user
curl -X DELETE https://sekha.yourdomain.com/api/v1/conversations/bulk \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"user_id": "user@example.com"}'
```

**Data export (portability):**

```bash
# Export user data in machine-readable format
curl -X POST https://sekha.yourdomain.com/api/v1/export \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"format": "json", "user_id": "user@example.com"}'
```

### HIPAA Compliance (Healthcare)

**Requirements:**

- ✅ Encryption at rest (LUKS, SQLCipher)
- ✅ Encryption in transit (TLS 1.3)
- ✅ Access logs (audit trail)
- ✅ Automatic logoff (session timeouts)
- ✅ User authentication (API keys)
- ⚠️ **Requires:** Business Associate Agreement (BAA)

**Additional hardening:**

```toml
[security]
# Auto-expire API keys
api_key_expiration_days = 90

# Session timeout
session_timeout_minutes = 30

# Require strong TLS
min_tls_version = "1.3"
```

---

## Incident Response

### Security Incident Playbook

**1. Detection**

```bash
# Check for unauthorized access
jq 'select(.status==401 or .status==403)' /var/log/sekha/access.log | \
  jq -s 'group_by(.ip) | .[] | {ip: .[0].ip, count: length}' | \
  sort -k2 -nr
```

**2. Containment**

```bash
# Block suspicious IP immediately
sudo ufw insert 1 deny from 203.0.113.45

# Rotate API key
/usr/local/bin/sekha-rotate-key.sh

# Restart service with new key
sudo systemctl restart sekha
```

**3. Eradication**

```bash
# Check for malicious data
sqlite3 /var/lib/sekha/sekha.db "SELECT * FROM conversations WHERE created_at > datetime('now', '-1 hour');"

# Remove if necessary
sqlite3 /var/lib/sekha/sekha.db "DELETE FROM conversations WHERE id = 'suspicious-id';"
```

**4. Recovery**

```bash
# Restore from clean backup if compromised
sudo systemctl stop sekha
gunzip -c /backups/sekha/clean_backup.db.gz > /var/lib/sekha/sekha.db
sudo systemctl start sekha
```

**5. Post-Incident**

- Document timeline
- Identify root cause
- Update security policies
- Notify stakeholders (if required by law)

---

## Security Checklist

### Pre-Deployment

- [ ] Generate strong API key (32+ characters)
- [ ] Enable TLS 1.3 (Let's Encrypt or commercial cert)
- [ ] Configure firewall (UFW/firewalld)
- [ ] Set file permissions (600 for configs)
- [ ] Enable audit logging
- [ ] Configure backups (encrypted)
- [ ] Set up monitoring (Prometheus/Grafana)

### Post-Deployment

- [ ] Test TLS configuration (SSL Labs scan)
- [ ] Verify firewall rules
- [ ] Test backup restoration
- [ ] Set up alerting (failed logins, high CPU)
- [ ] Document incident response plan
- [ ] Schedule security audits (quarterly)

### Ongoing Maintenance

- [ ] Rotate API keys (quarterly)
- [ ] Update dependencies (monthly)
- [ ] Review audit logs (weekly)
- [ ] Test backups (monthly)
- [ ] Patch OS/Docker (weekly)
- [ ] Security training (annually)

---

## Vulnerability Reporting

**Found a security issue?**

Email: [security@sekha.dev](mailto:security@sekha.dev)

**We commit to:**

- Acknowledge within 24 hours
- Fix critical issues within 7 days
- Credit researchers (if desired)
- No legal action for good-faith reports

**Responsible disclosure timeline:** 90 days

---

## Resources

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10)
- **CIS Benchmarks:** [cisecurity.org](https://www.cisecurity.org)
- **NIST Cybersecurity Framework:** [nist.gov/cyberframework](https://www.nist.gov/cyberframework)

---

*Last updated: January 2026*

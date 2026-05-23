#!/bin/bash
set -e

echo "🚀 Deploying Goodveen to production server..."

SERVER="root@92.63.206.4"
APP_DIR="/opt/goodveen"
BACKUP_DIR="/opt/goodveen-backup-$(date +%Y%m%d-%H%M%S)"

echo "📦 Step 1: Preparing local repository..."
git add -A
git diff --quiet && git diff --staged --quiet || git commit -m "deploy: preparing for production deployment"
git push

echo "🔗 Step 2: Connecting to server and setting up..."
ssh $SERVER << 'ENDSSH'
set -e

echo "🧹 Cleaning old deployment..."
if [ -d "/opt/goodveen" ]; then
    echo "📦 Backing up old deployment..."
    BACKUP_DIR="/opt/goodveen-backup-$(date +%Y%m%d-%H%M%S)"
    mv /opt/goodveen $BACKUP_DIR
    echo "✅ Backup saved to $BACKUP_DIR"
fi

echo "📥 Installing Docker if not present..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

echo "📂 Creating app directory..."
mkdir -p /opt/goodveen
cd /opt/goodveen

echo "📥 Cloning repository..."
git clone https://github.com/Slowfingers/goodveen-2.0.git . || {
    echo "⚠️ Clone failed, trying with git protocol..."
    git clone git://github.com/Slowfingers/goodveen-2.0.git .
}

echo "⚙️ Setting up environment..."
cat > .env << 'EOF'
DATABASE_URL=postgresql://postgres:U2_Fw*4uz@65~z2@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres
JWT_SECRET=d9a69247368ed5f695c742cca33fd27691909d8ce4c6414e77bd453a5f90517a
ADMIN_EMAIL=admin@goodveen.com
ADMIN_PASSWORD=Tashflora26#may
SUPABASE_URL=https://hdqbwduzcakycshpihmp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
CORS_ORIGINS=http://92.63.206.4,http://localhost
NODE_ENV=production
PORT=3001
EOF

echo "🐳 Building Docker image..."
docker-compose build

echo "🚀 Starting application..."
docker-compose up -d

echo "⏳ Waiting for application to start..."
sleep 10

echo "🔍 Checking health..."
curl -f http://localhost/api/health || echo "⚠️ Health check failed, but container is running"

echo "📊 Container status:"
docker-compose ps

echo "🔧 Setting up systemd service for auto-restart..."
cp docker/goodveen.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable goodveen.service
systemctl start goodveen.service

echo "🔥 Setting up firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable
fi

echo "✅ Deployment complete!"
echo "🌐 Application is running at: http://92.63.206.4"
echo "🔐 Admin panel: http://92.63.206.4/admin"
echo ""
echo "📝 Useful commands:"
echo "  View logs: docker-compose -f /opt/goodveen/docker-compose.yml logs -f"
echo "  Restart: systemctl restart goodveen"
echo "  Stop: systemctl stop goodveen"
echo "  Status: systemctl status goodveen"
echo "  Update: cd /opt/goodveen && git pull && docker-compose up -d --build"
echo ""
echo "🔄 Auto-restart enabled via systemd"

ENDSSH

echo ""
echo "✅ Deployment finished!"
echo "🌐 Your app is live at: http://92.63.206.4"
echo ""

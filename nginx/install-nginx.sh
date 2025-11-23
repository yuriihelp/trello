#!/bin/bash
echo "=== Установка Nginx конфигурации для takta.space ==="
sudo cp takta.space.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/takta.space.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
echo "✓ Nginx настроен для takta.space"

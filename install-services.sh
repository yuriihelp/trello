#!/bin/bash

echo "=== Установка Trello systemd services ==="

# Копируем service файлы
echo "1. Копирование service файлов..."
sudo cp systemd/*.service /etc/systemd/system/

# Перезагружаем systemd
echo "2. Перезагрузка systemd daemon..."
sudo systemctl daemon-reload

# Включаем автозапуск
echo "3. Включение автозапуска..."
sudo systemctl enable trello-postgres.service
sudo systemctl enable trello-backend.service  
sudo systemctl enable trello-frontend.service

echo ""
echo "✓ Сервисы установлены!"
echo ""
echo "Управление:"
echo "  sudo systemctl start trello-postgres"
echo "  sudo systemctl start trello-backend"
echo "  sudo systemctl start trello-frontend"
echo ""
echo "  sudo systemctl stop trello-postgres"
echo "  sudo systemctl stop trello-backend"
echo "  sudo systemctl stop trello-frontend"
echo ""
echo "  sudo systemctl status trello-backend"
echo ""
echo "Логи:"
echo "  tail -f /var/log/trello-backend.log"
echo "  tail -f /var/log/trello-frontend.log"

#!/bin/bash
sed -i 's/export function DashboardLayout/import { BotCard } from ".\/components\/BotCard";\nexport function DashboardLayout/g' src/DashboardPages.tsx

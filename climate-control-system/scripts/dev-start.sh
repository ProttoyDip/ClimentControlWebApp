#!/usr/bin/env bash
set -e

if [ ! -f backend/.env ]; then
	cp backend/.env.example backend/.env
fi

npm install
npm run dev

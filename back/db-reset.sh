#!/usr/bin/env bash
rm -rf drizzle
docker comopse rm EMM
sudo rm -rf ./postgres-data
bun drizzle-kit generate 

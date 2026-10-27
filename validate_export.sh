#!/usr/bin/env bash

diff -u <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/xbat-com-ua.xml") <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/xbat-com-ua_new.xml")

diff -u <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/prom.xml") <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/prom_new.xml")

diff -u <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/rozetka.xml") <(curl -sL "https://idoo-public.s3.eu-central-1.amazonaws.com/xbat/export/rozetka_new.xml")


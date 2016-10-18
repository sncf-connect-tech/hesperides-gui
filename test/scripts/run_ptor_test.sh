#!/bin/bash

echo "$0 take 2 arguments :"
echo "1 --> environment (ex: hesperides)"
echo "2 --> suite name (if not specified, default value is 'all')"
echo

environment=${1:-hesperides}
mysuite=${2:-all}


if [ ! -f "./data/data_${environment}.json" ];then
	echo "[ERROR] data file ${home_ptor}/data/data_${environment}.json does not exist"
	exit 1
fi

NOW=$(date)
echo "$NOW : running protractor tests for $environment environment and $mysuite suite"

protractor ./conf.js --params.data_json=./data/data_${environment}.json --suite $mysuite


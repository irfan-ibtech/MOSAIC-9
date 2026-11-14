#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

echo "=========================================================="
echo "          MOSAIC-9 — FULL SYSTEM TEST RUNNER              "
echo "=========================================================="

echo ""
echo ">> [1/3] Running Python Intelligence Tests (Pytest)..."
cd "$DIR/intelligence"
source venv/bin/activate
PYTHONPATH=. pytest tests/test_analytics.py -v

echo ""
echo ">> [2/3] Running Laravel API Tests (PHPUnit)..."
cd "$DIR/backend"
php artisan test --filter=MosaicApiTest

echo ""
echo ">> [3/3] Running Frontend Component & Logic Tests (Vitest)..."
cd "$DIR/frontend"
npm run test

echo ""
echo "=========================================================="
echo "   ALL TEST SUITES PASSED — MOSAIC-9 VERIFIED NOMINAL     "
echo "=========================================================="

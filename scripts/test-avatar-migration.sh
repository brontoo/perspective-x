#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
local_docker() {
  env -u DOCKER_HOST -u DOCKER_CONTEXT -u DOCKER_TLS -u DOCKER_TLS_VERIFY -u DOCKER_CERT_PATH docker --host=unix:///var/run/docker.sock "$@"
}
# Isolated fixture database only: no public port, no production connection and no host volume.
container=$(local_docker run --rm -d --network none --memory 256m --cpus 1 -e POSTGRES_PASSWORD=synthetic-fixture-only postgres:16-alpine)
trap 'local_docker rm -f "$container" >/dev/null' EXIT
ready=false
for attempt in {1..30}; do
  # The entrypoint briefly starts a bootstrap server with listen_addresses=''; wait for the final server.
  if [ "$(local_docker exec "$container" psql -X -U postgres -Atc "SELECT current_setting('listen_addresses') <> ''" 2>/dev/null)" = t ]; then ready=true; break; fi
  sleep 1
done
if [ "$ready" != true ]; then printf 'Fixture PostgreSQL did not become ready.\n' >&2; exit 1; fi
run_sql() { local_docker exec -i "$container" psql -X -v ON_ERROR_STOP=1 -U postgres; }
run_sql < tests/sql/avatar-migration-setup.sql
run_sql < supabase/migrations/202611140001_sync_profile_avatar_presets.sql
run_sql < supabase/migrations/202611140001_sync_profile_avatar_presets.sql
run_sql < tests/sql/avatar-migration-assert.sql

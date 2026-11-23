"""Build and preview the gallery over local HTTP."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

from build import build


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8102)
    args = parser.parse_args()
    with TemporaryDirectory(prefix='countyukiyoe-gallery-') as folder:
        build(Path(folder))
        handler = partial(SimpleHTTPRequestHandler, directory=folder)
        with ThreadingHTTPServer(('127.0.0.1', args.port), handler) as server:
            print(f'图鉴预览 http://127.0.0.1:{server.server_port}/', flush=True)
            try:
                server.serve_forever()
            except KeyboardInterrupt:
                pass

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "generate-download-stats.py"
SPEC = importlib.util.spec_from_file_location("generate_download_stats", MODULE_PATH)
assert SPEC and SPEC.loader
generate_download_stats = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(generate_download_stats)


class GenerateDownloadStatsTest(unittest.TestCase):
    def test_build_stats_keeps_unattributed_and_asset_aggregates(self):
        records = [
            {
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.dmg",
                "status": 200,
                "body_bytes_sent": 100,
                "country_code": "CN",
            },
            {
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.exe",
                "status": 200,
                "body_bytes_sent": 200,
            },
            {
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.app.tar.gz",
                "status": 206,
                "body_bytes_sent": 300,
                "country_code": "HK",
            },
            {
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.exe.sig",
                "status": 200,
                "body_bytes_sent": 5,
                "country_code": "US",
            },
            {
                "method": "POST",
                "uri": "/downloads/versions/0.6.54/Walnut.dmg",
                "status": 200,
                "body_bytes_sent": 999,
                "country_code": "US",
            },
            {
                "method": "GET",
                "uri": "/downloads/latest/downloads.json",
                "status": 200,
                "body_bytes_sent": 999,
                "country_code": "US",
            },
        ]

        with tempfile.TemporaryDirectory() as temp_dir:
            asset_root = Path(temp_dir) / "downloads"
            asset_dir = asset_root / "versions" / "0.6.54"
            asset_dir.mkdir(parents=True)
            (asset_dir / "Walnut.dmg").write_bytes(b"a" * 100)
            (asset_dir / "Walnut.exe").write_bytes(b"b" * 200)
            (asset_dir / "Walnut.app.tar.gz").write_bytes(b"c" * 300)

            log_path = Path(temp_dir) / "access.log"
            log_path.write_text(
                "\n".join(json.dumps(record) for record in records) + "\n",
                encoding="utf-8",
            )

            stats = generate_download_stats.build_stats(
                [log_path],
                asset_root=asset_root,
                top_assets=10,
            )

        self.assertEqual(stats["total_downloads"], 3)
        self.assertEqual(stats["total_requests"], 3)
        self.assertEqual(stats["partial_requests"], 1)
        self.assertEqual(stats["total_bytes"], 600)
        self.assertEqual(
            stats["unattributed"],
            {"downloads": 1, "requests": 1, "partial_requests": 0, "bytes": 200},
        )

        countries = {country["country_code"]: country for country in stats["countries"]}
        self.assertEqual(countries["CN"]["downloads"], 1)
        self.assertEqual(countries["CN"]["requests"], 1)
        self.assertEqual(countries["HK"]["bytes"], 300)
        self.assertNotIn(None, countries)

        assets = {asset["name"]: asset for asset in stats["assets"]}
        self.assertEqual(assets["Walnut.dmg"]["downloads"], 1)
        self.assertEqual(assets["Walnut.dmg"]["requests"], 1)
        self.assertEqual(assets["Walnut.exe"]["bytes"], 200)
        self.assertEqual(assets["Walnut.app.tar.gz"]["downloads"], 1)
        self.assertEqual(assets["Walnut.app.tar.gz"]["partial_requests"], 1)
        self.assertNotIn("Walnut.exe.sig", assets)

    def test_range_chunks_count_as_one_completed_download(self):
        records = [
            {
                "time": "2026-06-03T04:50:00+00:00",
                "remote_addr": "114.80.9.65",
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.exe",
                "status": 206,
                "body_bytes_sent": 400,
                "country_code": "CN",
            },
            {
                "time": "2026-06-03T04:50:10+00:00",
                "remote_addr": "114.80.9.65",
                "method": "GET",
                "uri": "/downloads/versions/0.6.54/Walnut.exe",
                "status": 206,
                "body_bytes_sent": 500,
                "country_code": "CN",
            },
        ]

        with tempfile.TemporaryDirectory() as temp_dir:
            asset_root = Path(temp_dir) / "downloads"
            asset_dir = asset_root / "versions" / "0.6.54"
            asset_dir.mkdir(parents=True)
            (asset_dir / "Walnut.exe").write_bytes(b"x" * 1000)

            log_path = Path(temp_dir) / "access.log"
            log_path.write_text(
                "\n".join(json.dumps(record) for record in records) + "\n",
                encoding="utf-8",
            )

            stats = generate_download_stats.build_stats(
                [log_path],
                asset_root=asset_root,
                top_assets=10,
            )

        self.assertEqual(stats["total_requests"], 2)
        self.assertEqual(stats["partial_requests"], 2)
        self.assertEqual(stats["total_downloads"], 1)
        self.assertEqual(stats["assets"][0]["downloads"], 1)
        self.assertEqual(stats["assets"][0]["requests"], 2)


if __name__ == "__main__":
    unittest.main()

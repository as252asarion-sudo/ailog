#!/usr/bin/env python3
"""Play Console へ AAB をアップロードして指定トラックに公開する。

使い方:
    python scripts/publish_play.py --aab dist/app.aab --track "AIログクローズドテスト"

- パッケージ名と versionName は app.json から自動取得
- リリースノートは whatsnew/<lang>.txt（例: whatsnew/ja-JP.txt）を読む
- 認証は google-service-account.json（カレントディレクトリ）
"""
import argparse
import json
import os
import sys

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]
KEY_FILE = "google-service-account.json"


def load_app_json():
    with open("app.json", encoding="utf-8") as f:
        return json.load(f)["expo"]


def load_release_notes():
    notes = []
    wdir = "whatsnew"
    if not os.path.isdir(wdir):
        return notes
    for fn in sorted(os.listdir(wdir)):
        if fn.endswith(".txt"):
            lang = fn[:-4]  # e.g. ja-JP
            with open(os.path.join(wdir, fn), encoding="utf-8") as f:
                text = f.read().strip()
            if text:
                notes.append({"language": lang, "text": text})
    return notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--aab", required=True, help="AAB ファイルのパス")
    ap.add_argument("--track", required=True, help="公開先トラックID")
    ap.add_argument("--status", default="completed",
                    choices=["completed", "draft", "inProgress", "halted"])
    args = ap.parse_args()

    app = load_app_json()
    pkg = app["android"]["package"]
    version_name = app.get("version", "")

    creds = service_account.Credentials.from_service_account_file(KEY_FILE, scopes=SCOPES)
    s = AuthorizedSession(creds)
    base = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{pkg}"
    upl = f"https://androidpublisher.googleapis.com/upload/androidpublisher/v3/applications/{pkg}"

    eid = s.post(f"{base}/edits").json()["id"]
    print(f"edit: {eid}")

    with open(args.aab, "rb") as f:
        r = s.post(f"{upl}/edits/{eid}/bundles?uploadType=media",
                   headers={"Content-Type": "application/octet-stream"}, data=f)
    if r.status_code != 200:
        sys.exit(f"upload failed {r.status_code}: {r.text[:800]}")
    vc = r.json()["versionCode"]
    print(f"uploaded versionCode: {vc}")

    release = {
        "name": f"{version_name} ({vc})",
        "versionCodes": [str(vc)],
        "status": args.status,
    }
    notes = load_release_notes()
    if notes:
        release["releaseNotes"] = notes

    r = s.put(f"{base}/edits/{eid}/tracks/{args.track}",
              json={"track": args.track, "releases": [release]})
    if r.status_code != 200:
        sys.exit(f"track update failed {r.status_code}: {r.text[:800]}")
    print(f"track '{args.track}' updated ({args.status})")

    r = s.post(f"{base}/edits/{eid}:commit")
    if r.status_code != 200:
        sys.exit(f"commit failed {r.status_code}: {r.text[:800]}")
    print(f"COMMIT OK -> {pkg} vc{vc} を '{args.track}' に公開しました")


if __name__ == "__main__":
    main()

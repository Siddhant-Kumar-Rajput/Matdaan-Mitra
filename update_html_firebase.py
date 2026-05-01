"""
Appends Firebase Analytics + Performance CDN scripts to the <head>
of every HTML page in MatDaan Mitra.
"""

import os

files = [
    ('index.html',              'js/'),
    ('onboarding.html',         'js/'),
    ('dashboard.html',          'js/'),
    ('modules/checklist.html',  '../js/'),
    ('modules/timeline.html',   '../js/'),
    ('modules/mythbuster.html', '../js/'),
]

FIREBASE_HEAD = """\
  <!-- Firebase Analytics + Performance — Google Services integration -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js" defer></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics-compat.js" defer></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-performance-compat.js" defer></script>"""

for html_path, prefix in files:
    if not os.path.exists(html_path):
        print(f'SKIP (not found): {html_path}')
        continue

    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False

    # 1. Add Firebase CDN to <head> if not already present
    if 'firebase-app-compat.js' not in content:
        content = content.replace('</head>', FIREBASE_HEAD + '\n</head>', 1)
        changed = True

    # 2. Add analytics.js if not already present
    analytics_tag = f'<script src="{prefix}analytics.js" defer></script>'
    if 'analytics.js' not in content:
        content = content.replace('</body>', f'  {analytics_tag}\n</body>', 1)
        changed = True

    # 3. Add tests.js if not already present
    tests_tag = f'<script src="{prefix}tests.js" defer></script>'
    if 'tests.js' not in content:
        content = content.replace('</body>', f'  {tests_tag}\n</body>', 1)
        changed = True

    if changed:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated : {html_path}')
    else:
        print(f'Already OK: {html_path}')

print('\nDone.')

import os

files = [
    'index.html',
    'onboarding.html',
    'dashboard.html',
    'modules/checklist.html',
    'modules/timeline.html',
    'modules/mythbuster.html'
]

firebase_scripts = '''
<!-- Firebase Analytics + Performance — Google Services integration -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js" defer></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics-compat.js" defer></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-performance-compat.js" defer></script>
'''

for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Append to head
    if firebase_scripts.strip() not in content:
        content = content.replace('</head>', f'{firebase_scripts}</head>')

    # Append analytics and tests
    is_module = file.startswith('modules/')
    prefix = '../' if is_module else ''
    
    analytics_script = f'<script src="{prefix}js/analytics.js" defer></script>'
    tests_script = f'<script src="{prefix}js/tests.js" defer></script>'

    if analytics_script not in content:
        content = content.replace('</body>', f'  {analytics_script}\n  {tests_script}\n</body>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print('HTML updated successfully')

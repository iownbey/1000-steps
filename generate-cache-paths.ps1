Get-ChildItem -File -Recurse | Where-Object {$_.FullName -CNotMatch "\.github|\.ps1|\.bat"} | Resolve-Path -Relative | ForEach-Object {"'${_}',"} | ForEach-Object {$_.Replace("\","/")}
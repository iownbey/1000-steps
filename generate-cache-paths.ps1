Get-ChildItem -Recurse | Resolve-Path -Relative | ForEach-Object {"'${_}',"} | ForEach-Object {$_.Replace("\","/")}
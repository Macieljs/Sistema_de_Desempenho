 = @{ login='admin@admin.com'; senha='123' } | ConvertTo-Json
Invoke-WebRequest http://localhost:3000/api/auth/login -Method POST -ContentType 'application/json' -Body  -UseBasicParsing

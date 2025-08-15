$ErrorActionPreference = 'Stop'

$u = 'https://www.lotteryextreme.com/euromillions/prize_breakdown(2025-08-08)'
$dateIso = '2025-08-08T00:00:00.000Z'

function Get-DisplayBallNumbers {
    param([string]$Html)
    $rxOpts = [System.Text.RegularExpressions.RegexOptions] 'Singleline, IgnoreCase'
    $ulPattern = '<ul\s+class=''displayball''[^>]*>([\s\S]*?)</ul>'
    $ulMatch = [regex]::Match($Html, $ulPattern, $rxOpts)
    if (-not $ulMatch.Success) { return @() }
    $block = $ulMatch.Groups[1].Value
    $nums = @()
    $liPattern = '<li[^>]*>(\d+)\s*'
    foreach ($m in [regex]::Matches($block, $liPattern, $rxOpts)) {
        $n = [int]$m.Groups[1].Value
        $nums += $n
    }
    return ,$nums
}

try {
    $resp = Invoke-WebRequest -UseBasicParsing $u
    $html = [string]$resp.Content
    $all = Get-DisplayBallNumbers -Html $html
    if ($all.Count -lt 7) { throw "Parse error: expected 7 numbers, got $($all.Count)" }
    $numbers = $all[0..4]
    $stars   = $all[5..6]

    $out = [pscustomobject]@{
        date     = $dateIso
        provider = 'lotteryextreme'
        game     = 'euromillions'
        numbers  = $numbers
        stars    = $stars
    }
}
catch {
    $out = [pscustomobject]@{
        date     = $dateIso
        provider = 'lotteryextreme'
        game     = 'euromillions'
        numbers  = @()
        stars    = @()
        error    = ('Scrape error: ' + $_.Exception.Message)
        endpoint = $u
    }
}

if (-not (Test-Path 'data')) { New-Item -ItemType Directory -Path 'data' | Out-Null }
$out | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 'data\tirage.json'


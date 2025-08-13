param()
$ErrorActionPreference = 'Stop'
$u = 'https://www.lotteryextreme.com/euromillions/prize_breakdown(2025-08-08)'
$d = '2025-08-08T00:00:00.000Z'

function Remove-HtmlTags {
    param([string]$InputText)
    return ([regex]::Replace($InputText, '<[^>]+>', '') -replace '\s+', ' ').Trim()
}

try {
    $resp = Invoke-WebRequest -UseBasicParsing $u
    $html = [string]$resp.Content
    # Dump de l'HTML pour debug
    if (-not (Test-Path 'data')) { New-Item -ItemType Directory -Path 'data' | Out-Null }
    $html | Out-File -Encoding UTF8 'data/prize_raw.html'
    $rows = @()

    $rxOpts = [Text.RegularExpressions.RegexOptions]::Singleline -bor [Text.RegularExpressions.RegexOptions]::IgnoreCase
    $tbMatch = [regex]::Match($html, '<table[^>]*class=[''"]tbsg[''\"][^>]*>([\s\S]*?)</table>', $rxOpts)
    $scope = if ($tbMatch.Success) { $tbMatch.Groups[1].Value } else { $html }

    $rowPattern = "<tr[^>]*class='sg[12]'[^>]*>\s*<td[^>]*>\s*([\s\S]*?)\s*<td[^>]*>\s*([\s\S]*?)\s*<td[^>]*>\s*([\s\S]*?)\s*</tr>"
    foreach ($m in [regex]::Matches($scope, $rowPattern, $rxOpts)) {
        $lab = Remove-HtmlTags $m.Groups[1].Value
        $win = Remove-HtmlTags $m.Groups[2].Value
        $pr  = Remove-HtmlTags $m.Groups[3].Value

        $label = ((($lab -replace '\s+', '') -replace 'Match|Numbers|Stars|Numéros|Étoiles|Etoiles', '') -replace '[^0-9\+]', '')
        if ($label -notmatch '^\d+\+\d+$') { continue }
        if ($pr -notmatch '\d') { continue }

        $w = 0
        if ($win -match '\d') { $w = [int]($win -replace '[^0-9]', '') }

        $cur = 'EUR'

        $num = ($pr -replace '[^0-9\.,\s]', '')
        $num = ($num -replace '\s','')
        if ($num -match ',') { $amt = [double](($num -replace '\\.', '') -replace ',', '.') }
        else { $amt = [double]($num -replace ',', '') }

        $rows += [pscustomobject]@{
            rankLabel = $label
            winners   = $w
            amount    = [double]$amt
            currency  = $cur
        }
    }

    $out = [pscustomobject]@{ date = $d; breakdown = $rows }
    if ($rows.Count -eq 0) {
        # Ajoute un diagnostic simple pour aider
        $trCount = ([regex]::Matches($scope, '<tr[^>]*>([\s\S]*?)</tr>', $rxOpts)).Count
        $out = [pscustomobject]@{ date = $d; breakdown = @(); error = "No prize rows parsed (trs=$trCount)"; endpoint = $u }
    }
}
catch {
    $out = [pscustomobject]@{ date = $d; breakdown = @(); error = ('Scrape error: ' + $_.Exception.Message); endpoint = $u }
}

$out | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 'data\gains.json'


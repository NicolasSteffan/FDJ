$ErrorActionPreference = 'Stop'

$dateIso = '2025-08-08T00:00:00.000Z'

function Normalize-Amount {
  param([string]$text)
  $num = ($text -replace '[^0-9,\.\s]','') -replace '\s',''
  if ($num -match ',') { return [double](($num -replace '\.', '') -replace ',', '.') }
  else { return [double]($num -replace ',', '') }
}

function Build-Row {
  param([string]$label,[string]$winners,[string]$amount,[string]$currency)
  $cleanLabel = (($label -replace '\s+', '') -replace '[^0-9\+]', '')
  if ($cleanLabel -notmatch '^\d+\+\d+$') { return $null }
  $w = 0; if ($winners -match '\d') { $w = [int]($winners -replace '[^0-9]','') }
  $amt = Normalize-Amount $amount
  return [pscustomobject]@{ rankLabel=$cleanLabel; winners=$w; amount=[double]$amt; currency=$currency }
}

function Try-PDJ {
  $u = 'https://www.pdj.pf/resultats/resultats-de-leuro-millions-my-million/'
  try {
    $resp = Invoke-WebRequest -UseBasicParsing $u
    $html = [string]$resp.Content
    $section = [regex]::Match($html, 'Répartition des gains pour ce tirage([\s\S]*?)</table>', 'IgnoreCase').Groups[1].Value
    if (-not $section) { return $null }
    $rows = @()
    foreach ($tr in [regex]::Matches($section, '<tr[^>]*>([\s\S]*?)</tr>', 'IgnoreCase')) {
      $cells = [regex]::Matches($tr.Groups[1].Value, '<t[dh][^>]*>([\s\S]*?)</t[dh]>', 'IgnoreCase')
      if ($cells.Count -lt 4) { continue }
      $comb  = ($cells[0].Groups[1].Value -replace '<[^>]+>','').Trim()
      $gfr   = ($cells[2].Groups[1].Value -replace '<[^>]+>','').Trim()
      $aEto  = ($cells[3].Groups[1].Value -replace '<[^>]+>','').Trim()
      $row = Build-Row $comb $gfr $aEto 'XPF'
      if ($row) { $rows += $row }
    }
    if ($rows.Count -gt 0) { return @{ provider='pdj'; endpoint=$u; rows=$rows } }
    return $null
  } catch { return $null }
}

function Try-LBN {
  # LBN n'a pas d'URL canonique par date fixe → pour 08/08/2025 les rapports existent sur plusieurs pages.
  $candidates = @(
    'https://www.lesbonsnumeros.com/euromillions/resultats/rapports-tirage-1866-vendredi-8-aout-2025.htm',
    'https://www.lesbonsnumeros.com/euromillions/'
  )
  foreach ($u in $candidates) {
    try {
      $resp = Invoke-WebRequest -UseBasicParsing $u
      $html = [string]$resp.Content
      $opt = [regex]::Match($html, 'Option\s*Etoile\+([\s\S]*?)</table>', 'IgnoreCase').Groups[1].Value
      if (-not $opt) { continue }
      $rows = @()
      foreach ($tr in [regex]::Matches($opt, '<tr[^>]*>([\s\S]*?)</tr>', 'IgnoreCase')) {
        $cells = [regex]::Matches($tr.Groups[1].Value, '<t[dh][^>]*>([\s\S]*?)</t[dh]>', 'IgnoreCase')
        if ($cells.Count -lt 3) { continue }
        $comb = ($cells[0].Groups[1].Value -replace '<[^>]+>','').Trim()
        $gain = ($cells[1].Groups[1].Value -replace '<[^>]+>','').Trim()
        $row = Build-Row $comb '' $gain 'EUR'
        if ($row) { $rows += $row }
      }
      if ($rows.Count -gt 0) { return @{ provider='lesbonsnumeros'; endpoint=$u; rows=$rows } }
    } catch { continue }
  }
  return $null
}

$result = Try-PDJ
if (-not $result) { $result = Try-LBN }
if (-not $result) {
  function Try-EuroMillones {
    $u = 'https://www.euromillones.com/en/results/euromillions'
    try {
      $resp = Invoke-WebRequest -UseBasicParsing $u
      $html = [string]$resp.Content
      # Cherche le premier tableau de breakdown avec colonnes Category | Winners | Prize
      $block = [regex]::Match($html, '(?is)<table[^>]*>\s*<thead>.*?Category.*?Winners.*?Prize.*?</thead>([\s\S]*?)</table>').Groups[1].Value
      if (-not $block) { return $null }
      $rows = @()
      foreach ($tr in [regex]::Matches($block, '<tr[^>]*>([\s\S]*?)</tr>', 'IgnoreCase')) {
        $cells = [regex]::Matches($tr.Groups[1].Value, '<t[dh][^>]*>([\s\S]*?)</t[dh]>', 'IgnoreCase')
        if ($cells.Count -lt 3) { continue }
        $cat = ($cells[0].Groups[1].Value -replace '<[^>]+>','').Trim() # ex: 5+2
        $win = ($cells[1].Groups[1].Value -replace '<[^>]+>','').Trim()
        $prz = ($cells[2].Groups[1].Value -replace '<[^>]+>','').Trim()
        $row = Build-Row $cat $win $prz 'EUR'
        if ($row) { $rows += $row }
      }
      if ($rows.Count -gt 0) { return @{ provider='euromillones'; endpoint=$u; rows=$rows } }
      return $null
    } catch { return $null }
  }
  $result = Try-EuroMillones
}

if ($result) {
  $out = [pscustomobject]@{
    date      = $dateIso
    breakdown = $result.rows
    provider  = $result.provider
    endpoint  = $result.endpoint
  }
} else {
  $out = [pscustomobject]@{
    date      = $dateIso
    breakdown = @()
    error     = 'No Etoile+ breakdown parsed from PDJ or LesBonsNumeros'
  }
}

if (-not (Test-Path 'data')) { New-Item -ItemType Directory -Path 'data' | Out-Null }
$out | ConvertTo-Json -Depth 4 | Out-File -Encoding UTF8 'data\tirage_etoile.json'


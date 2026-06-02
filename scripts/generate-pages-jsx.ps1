$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$sourceDir = Join-Path $root "tempalte-design"
$outputDir = Join-Path $root "components\pages\generated"

$pages = [ordered]@{
  "404" = "NotFoundPage"
  "about" = "AboutPage"
  "blog" = "BlogPage"
  "contact" = "ContactPage"
  "faq" = "FaqPage"
  "index" = "HomePage"
  "licensing" = "LicensingPage"
  "product-details" = "ProductDetailsPage"
  "shop" = "ShopPage"
  "terms" = "TermsPage"
}

function Convert-ToJsString {
  param([string]$Value)

  return ($Value | ConvertTo-Json -Compress)
}

function Convert-StyleName {
  param([string]$Name)

  if ($Name.StartsWith("--")) {
    return "'" + $Name + "'"
  }

  $parts = $Name.Split("-")
  if ($parts.Length -eq 1) {
    return $parts[0]
  }

  $first = $parts[0]
  $rest = $parts[1..($parts.Length - 1)] | ForEach-Object {
    if ($_.Length -eq 0) { return "" }
    return $_.Substring(0, 1).ToUpper() + $_.Substring(1)
  }

  return $first + ($rest -join "")
}

function Convert-StyleValue {
  param([string]$StyleText)

  $rules = @()
  foreach ($declaration in ($StyleText -split ";")) {
    if ([string]::IsNullOrWhiteSpace($declaration)) {
      continue
    }

    $pair = $declaration.Split(":", 2)
    if ($pair.Length -ne 2) {
      continue
    }

    $name = Convert-StyleName $pair[0].Trim()
    $value = $pair[1].Trim()
    $rules += "${name}: $(Convert-ToJsString $value)"
  }

  return "{{ " + ($rules -join ", ") + " }}"
}

function Convert-AttributeName {
  param([string]$Name)

  $map = @{
    "class" = "className"
    "tabindex" = "tabIndex"
    "crossorigin" = "crossOrigin"
    "fetchpriority" = "fetchPriority"
    "srcset" = "srcSet"
    "viewbox" = "viewBox"
    "preserveaspectratio" = "preserveAspectRatio"
    "fill-rule" = "fillRule"
    "clip-rule" = "clipRule"
    "clip-path" = "clipPath"
    "stroke-linecap" = "strokeLinecap"
    "stroke-linejoin" = "strokeLinejoin"
    "stroke-width" = "strokeWidth"
    "stroke-miterlimit" = "strokeMiterlimit"
    "stop-color" = "stopColor"
    "stop-opacity" = "stopOpacity"
    "color-interpolation-filters" = "colorInterpolationFilters"
    "xlink:href" = "xlinkHref"
    "xmlns:xlink" = "xmlnsXlink"
    "for" = "htmlFor"
    "maxlength" = "maxLength"
    "minlength" = "minLength"
    "readonly" = "readOnly"
    "autocomplete" = "autoComplete"
    "autocapitalize" = "autoCapitalize"
    "autocorrect" = "autoCorrect"
    "spellcheck" = "spellCheck"
    "contenteditable" = "contentEditable"
    "inputmode" = "inputMode"
    "referrerpolicy" = "referrerPolicy"
    "playsinline" = "playsInline"
    "enterkeyhint" = "enterKeyHint"
    "http-equiv" = "httpEquiv"
  }

  if ($map.ContainsKey($Name)) {
    return $map[$Name]
  }

  return $Name
}

function Rewrite-InternalLink {
  param([string]$Target)

  if ([string]::IsNullOrWhiteSpace($Target) -or $Target.StartsWith("#") -or $Target -match "^[a-z]+:") {
    return $Target
  }

  $normalized = $Target.Replace("./", "")
  $normalized = $normalized -replace "/index\.html$", "/"
  $normalized = $normalized -replace "index\.html$", ""

  if ($normalized -eq "") {
    return "/"
  }

  if ($normalized.StartsWith("shop/") -and $normalized.EndsWith(".html")) {
    return "/" + $normalized.Substring(0, $normalized.Length - 5)
  }

  if ($normalized.StartsWith("blog/") -and $normalized.EndsWith(".html")) {
    return "/" + $normalized.Substring(0, $normalized.Length - 5)
  }

  if ($normalized.StartsWith("category/") -and $normalized.EndsWith(".html")) {
    return "/" + $normalized.Substring(0, $normalized.Length - 5)
  }

  if ($normalized.EndsWith(".html")) {
    $trimmed = $normalized.Substring(0, $normalized.Length - 5)
    if ($trimmed -eq "") {
      return "/"
    }

    return "/" + $trimmed
  }

  return $Target
}

function Rewrite-AttributeValue {
  param(
    [string]$Name,
    [string]$Value
  )

  if ($Value.StartsWith("../framerusercontent.com/")) {
    return $Value.Replace("../framerusercontent.com/", "https://framerusercontent.com/")
  }

  if (($Name -eq "href" -or $Name -eq "src") -and $Value.StartsWith("images/")) {
    return "/template-design/" + $Value
  }

  if (($Name -eq "href" -or $Name -eq "src") -and $Value.StartsWith("fonts/")) {
    return "/template-design/" + $Value
  }

  if ($Name -eq "srcset" -and $Value.Contains("images/")) {
    return [regex]::Replace($Value, '(^|,\s*)images/', '$1/template-design/images/')
  }

  if ($Name -eq "href") {
    return Rewrite-InternalLink $Value
  }

  if ($Name -eq "style") {
    $updated = $Value -replace "url\((['""]?)images/", "url(`$1/template-design/images/"
    $updated = $updated -replace "url\((['""]?)fonts/", "url(`$1/template-design/fonts/"
    return $updated
  }

  return $Value
}

function Convert-Attributes {
  param(
    $Attributes,
    [string]$TagName
  )

  $items = @()
  $inputType = $null

  foreach ($attribute in $Attributes) {
    if ($attribute.LocalName -eq "type") {
      $inputType = $attribute.Value.ToLowerInvariant()
      break
    }
  }

  foreach ($attribute in $Attributes) {
    $attributeName = $attribute.LocalName

    if ($attributeName -eq "xmlns") {
      continue
    }

    $name = Convert-AttributeName $attributeName
    $value = Rewrite-AttributeValue $attributeName $attribute.Value

    if ($name -eq "style") {
      $items += "style=$(Convert-StyleValue $value)"
      continue
    }

    if (
      $attributeName -eq "value" -and
      ($TagName -eq "input" -or $TagName -eq "textarea") -and
      $inputType -notin @("submit", "button", "reset", "checkbox", "radio", "range", "color", "image")
    ) {
      $items += "defaultValue={$(Convert-ToJsString $value)}"
      continue
    }

    $items += "$name={$(Convert-ToJsString $value)}"
  }

  if ($items.Count -eq 0) {
    return ""
  }

  return " " + ($items -join " ")
}

function Convert-Node {
  param(
    $Node,
    [int]$Depth = 2
  )

  $indent = ("  " * $Depth)
  $childIndent = ("  " * ($Depth + 1))

  if ($Node.NodeType -eq [System.Xml.XmlNodeType]::Comment) {
    return ""
  }

  if ($Node.NodeType -eq [System.Xml.XmlNodeType]::Text -or $Node.NodeType -eq [System.Xml.XmlNodeType]::CDATA) {
    if ([string]::IsNullOrWhiteSpace($Node.Value)) {
      return ""
    }

    return $indent + "{" + (Convert-ToJsString ($Node.Value.Trim())) + "}"
  }

  if ($Node.NodeType -ne [System.Xml.XmlNodeType]::Element) {
    return ""
  }

  $tagName = $Node.LocalName

  if ($tagName -eq "script") {
    return ""
  }

  $attributes = Convert-Attributes -Attributes $Node.Attributes -TagName $tagName
  $children = @()
  foreach ($child in $Node.ChildNodes) {
    $converted = Convert-Node -Node $child -Depth ($Depth + 1)
    if (-not [string]::IsNullOrWhiteSpace($converted)) {
      $children += $converted
    }
  }

  if ($children.Count -eq 0) {
    return "$indent<$tagName$attributes />"
  }

  if ($children.Count -eq 1 -and $children[0].TrimStart().StartsWith("{`"")) {
    return "$indent<$tagName$attributes>$($children[0].Trim())</$tagName>"
  }

  return @(
    "$indent<$tagName$attributes>"
    ($children -join "`n")
    "$indent</$tagName>"
  ) -join "`n"
}

function Convert-Page {
  param(
    [string]$PageSourceName,
    [string]$ComponentName
  )

  $html = Get-Content -Raw (Join-Path $sourceDir "$PageSourceName.html")
  $body = [regex]::Match($html, '<body[^>]*>([\s\S]*?)</body>', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase).Groups[1].Value
  [xml]$xml = "<root>$body</root>"

  $children = @()
  foreach ($node in $xml.root.ChildNodes) {
    $converted = Convert-Node -Node $node -Depth 2
    if (-not [string]::IsNullOrWhiteSpace($converted)) {
      $children += $converted
    }
  }

  $componentSource = @(
    "export default function $ComponentName() {"
    "  return ("
    "    <>"
    ($children -join "`n")
    "    </>"
    "  );"
    "}"
    ""
  ) -join "`n"

  Set-Content -Path (Join-Path $outputDir "$ComponentName.jsx") -Value $componentSource -Encoding UTF8
}

New-Item -ItemType Directory -Force $outputDir | Out-Null

foreach ($entry in $pages.GetEnumerator()) {
  Convert-Page -PageSourceName $entry.Key -ComponentName $entry.Value
}

$indexLines = @()
foreach ($entry in $pages.GetEnumerator()) {
  $indexLines += "export { default as $($entry.Value) } from `"./$($entry.Value)`";"
}
$indexLines += ""

Set-Content -Path (Join-Path $outputDir "index.js") -Value ($indexLines -join "`n") -Encoding UTF8

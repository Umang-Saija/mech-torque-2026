Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100

# Select English voice if available
$voices = $synth.GetInstalledVoices()
foreach ($v in $voices) {
    if ($v.VoiceInfo.Culture.Name -like "en*") {
        $synth.SelectVoice($v.VoiceInfo.Name)
        break
    }
}

$outputFile = Join-Path $PSScriptRoot "voiceover.wav"
$synth.SetOutputToWaveFile($outputFile)

$scriptText = @"
Welcome to Mech Torque. Precision engineered industrial valve gearboxes manufactured in Rajkot, India.
Designed to withstand up to twenty-four hundred Newton-meters of extreme mechanical torque.
Featuring ASTM grade cast iron housings, high tensile bronze worm wheels, precision ground carbon steel shafts, and an IP67 weatherproof enclosure.
Compliant with ISO 5211 standard mounting flanges for seamless valve automation.
Mech Torque. Built for unyielding reliability in heavy industry.
"@

$synth.Speak($scriptText)
$synth.Dispose()

Write-Output "Voiceover created: $outputFile"

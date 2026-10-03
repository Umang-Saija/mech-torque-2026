const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const voiceoverText = `Welcome to Mech Torque, precision engineered industrial valve gearboxes manufactured in Rajkot, India.
Designed to withstand up to twenty-four hundred Newton-meters of extreme mechanical torque.
Featuring ASTM grade cast iron housing, high tensile aluminum bronze worm wheels, precision ground carbon steel shafts, and an IP67 weatherproof enclosure.
Compliant with ISO 5211 standard mounting flanges for seamless butterfly and ball valve automation.
From power generation to water treatment and chemical refineries, Mech Torque delivers unyielding reliability and uncompromising mechanical strength.
Mech Torque. Built for heavy industry. Built to endure.`;

const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.Volume = 100

$voices = $synth.GetInstalledVoices()
foreach ($v in $voices) {
    if ($v.VoiceInfo.Culture.Name -like "en*") {
        $synth.SelectVoice($v.VoiceInfo.Name)
        break
    }
}

$outputFile = "${path.join(__dirname, 'voiceover.wav').replace(/\\/g, '\\\\')}"
$synth.SetOutputToWaveFile($outputFile)

$text = @"
${voiceoverText}
"@

$synth.Speak($text)
$synth.Dispose()
Write-Output "Done voiceover"
`;

fs.writeFileSync(path.join(__dirname, 'temp_synth.ps1'), psScript, 'utf8');

try {
    console.log('🎙️ Generating professional voiceover...');
    execSync('powershell -ExecutionPolicy Bypass -File temp_synth.ps1', { stdio: 'inherit' });
    fs.unlinkSync(path.join(__dirname, 'temp_synth.ps1'));
    console.log('✅ Voiceover WAV generated!');
} catch (e) {
    console.error('TTS error:', e.message);
}

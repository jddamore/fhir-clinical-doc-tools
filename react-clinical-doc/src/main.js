
import './style.css'
import { openFhirRendererWindow } from './openFhirRendererWindow.js';

document.querySelector('#app').innerHTML = `

<section id="fhir-input-section" style="margin-bottom: 2rem;">
  <label for="fhir-input" style="font-weight: bold; display: block; margin-bottom: 0.5rem;">Paste FHIR XML or JSON:</label>
  <textarea id="fhir-input" rows="8" style="width: 100%; max-width: 600px; font-family: monospace; font-size: 1rem; padding: 0.5rem;"></textarea>
  <div style="margin-top: 1rem;">
    <button id="open-fhir-renderer" style="padding: 0.5rem 1rem; font-size: 1rem;">Open FHIR Renderer in New Window</button>
  </div>
</section>


<div class="ticks"></div>
<section id="spacer"></section>
`

// Add event listener for the new button to open a React-powered window
document.getElementById('open-fhir-renderer').addEventListener('click', function () {
  const fhirContent = document.getElementById('fhir-input').value;
  openFhirRendererWindow(fhirContent);
});

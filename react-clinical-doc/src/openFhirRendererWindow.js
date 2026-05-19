// This file exports a function to open a new window and render the FHIR document using React
export function openFhirRendererWindow(fhirContent) {
  const win = window.open('', '_blank');
  if (!win) return;
  // Base64-encode the FHIR content to avoid JS syntax errors
  let b64 = '';
  if (typeof btoa === 'function') {
    b64 = btoa(unescape(encodeURIComponent(fhirContent)))
      .replace(/\\/g, "\\\\") // escape backslashes
      .replace(/"/g, '\\"')      // escape double quotes
      .replace(/\n/g, "\\n")    // escape newlines
      .replace(/\r/g, "\\r");   // escape carriage returns
  }
  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FHIR Document Renderer</title>
      <style>
        body { font-family: sans-serif; margin: 2rem; }
        table.fhir-section-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 2rem;
        }
        table.fhir-section-table th, table.fhir-section-table td {
          border: 1px solid #888;
          padding: 0.75em 1em;
          vertical-align: top;
        }
        table.fhir-section-table th {
          background: #f2f2f2;
          text-align: left;
          font-weight: bold;
        }
        table.fhir-section-table tr.section-title-row th {
          background: #e0e7ef;
          font-size: 1.1em;
        }
      </style>
      <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    </head>
    <body>
      <div id="root"></div>
      <script>
        // Decode base64-encoded FHIR content
        function b64DecodeUnicode(str) {
          return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
        }
        window.fhirContent = b64DecodeUnicode("${b64}");
        const { useState, useEffect, Fragment } = React;
        function FhirDocumentRenderer({ fhirContent }) {
          const [doc, setDoc] = useState(null);
          const [error, setError] = useState(null);
          useEffect(() => {
            setError(null);
            setDoc(null);
            if (!fhirContent) {
              setError('No FHIR content provided.');
              return;
            }
            try {
              const bundle = JSON.parse(fhirContent);
              if (!bundle.entry || !bundle.entry[0] || !bundle.entry[0].resource) {
                setError('Invalid FHIR Bundle structure.');
                return;
              }
              const resource = bundle.entry[0].resource;
              const docText = resource.text && resource.text.div ? resource.text.div : '';
              const sections = Array.isArray(resource.section) ? resource.section : [];
              setDoc({ docText, sections });
            } catch (e) {
              setError('Failed to parse FHIR as JSON. Only JSON is supported in this demo.');
            }
          }, [fhirContent]);

          // Helper to render a section row
          function renderSectionRow(section, idx) {
            const title = section.title;
            let html = '';
            if (section.text && section.text.div) {
              html = section.text.div;
            } else if (section.text && section.text.status) {
              html = '<em>No narrative text available.</em>';
            } else {
              html = '<em>No text for this section.</em>';
            }
            // If the section text contains a <table>, render it full width
            let tableHtml = '';
            if (html.includes('<table')) {
              // Extract and style all tables
              tableHtml = html.replace(/<table/gi, '<table class="fhir-section-table"');
            }
            return [
              React.createElement('tr', { key: '', className: 'section-title-row' },
                React.createElement('th', { colSpan: 2 }, title)
              ),
              React.createElement('tr', { key: '' },
                React.createElement('td', { colSpan: 2, style: { background: '#fff' }, dangerouslySetInnerHTML: { __html: tableHtml || html } })
              )
            ];
          }

          return React.createElement('div', { style: { maxWidth: '100%' } },
            error && React.createElement('div', { style: { color: 'red', marginBottom: '1rem' } }, error),
            doc && React.createElement(Fragment, null,
              React.createElement('h2', null, 'Document Text'),
              doc.docText
                ? React.createElement('div', { style: { border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem' }, dangerouslySetInnerHTML: { __html: doc.docText } })
                : React.createElement('div', { style: { border: '1px solid #ccc', padding: '1rem', marginBottom: '2rem', fontStyle: 'italic', color: '#888' } }, 'No document narrative text.'),
              doc.sections && doc.sections.length > 0 && React.createElement('table', { className: 'fhir-section-table' },
                React.createElement('tbody', null,
                  doc.sections.flatMap((section, idx) => renderSectionRow(section, idx))
                )
              )
            )
          );
        }
        ReactDOM.createRoot(document.getElementById('root')).render(
          React.createElement(FhirDocumentRenderer, { fhirContent: window.fhirContent })
        );
      </script>
    </body>
    </html>
  `);
  win.document.close();
}

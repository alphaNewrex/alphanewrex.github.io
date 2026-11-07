import type { APIRoute } from 'astro';

// The resume is compiled by the alphaNewrex/resume repo's CI and published on its
// gh-actions branch. GitHub serves raw files as application/octet-stream, which
// forces a download, so the build copies the latest PDF here to serve it from
// this site as application/pdf (rendered by /resume, opens inline in browsers).
// Redeploy this site to pick up a new resume.
const SOURCE =
	'https://raw.githubusercontent.com/alphaNewrex/resume/gh-actions/output/output/Harsh_Gujarathi_Resume.pdf';

export const GET: APIRoute = async () => {
	const res = await fetch(SOURCE);
	if (!res.ok) {
		// Fail the build rather than ship a stale or missing resume.
		throw new Error(`Could not fetch resume PDF (${res.status} ${res.statusText}) from ${SOURCE}`);
	}
	const pdf = await res.arrayBuffer();
	if (new TextDecoder().decode(pdf.slice(0, 5)) !== '%PDF-') {
		throw new Error(`Resume source did not return a PDF: ${SOURCE}`);
	}
	return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
};

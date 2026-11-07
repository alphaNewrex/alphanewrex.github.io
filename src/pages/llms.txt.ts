import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { PERSON, SITE_DESCRIPTION } from '../config';
import { projects } from '../data/projects';

// /llms.txt (https://llmstxt.org): a plain-Markdown summary for AI assistants and
// answer engines. Built from the same data as the site; the experience list mirrors
// src/pages/cv.astro, so update both together.
export const GET: APIRoute = async ({ site }) => {
	const url = (path: string) => new URL(path, site).href;
	const posts = (await getCollection('blog')).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

	const body = `# ${PERSON.name}

> ${SITE_DESCRIPTION}

${PERSON.name} (${PERSON.jobTitle}) is based in ${PERSON.location}. ${PERSON.description} Contact: ${PERSON.email}.

## Experience

- Graduate Student Researcher, NEXS Lab, Georgia Institute of Technology (Aug 2026 – present): self-speculative decoding for Mixture-of-Experts (MoE) LLM inference, raising output throughput by 10–21%; large-scale inference benchmarks on vLLM and NVIDIA H200 GPUs.
- Software Engineer, Microsoft, Azure Migrate (Jul 2024 – Jul 2026): RAG-based assistant with an NL-to-KQL pipeline (agent accuracy 40% → 85%); evaluation pipelines for the AI agent; assessment coverage to 99.9% across 100K+ enterprise workloads; owned the IIS discovery and assessment microservice; on-call owner for a 99.9% SLA service.
- Member of Technical Staff Intern, DevRev (Jan – Jun 2024): Redis-based distributed rate limiting (60K+ daily events), notification deduplication (85% less spam), GPT-4 digest summarization.
- Software Engineer Intern, Microsoft (May – Jul 2023): OpenTelemetry meter telemetry for Azure Business Continuity Center, shipped as a NuGet library with 99% test coverage.
- Undergraduate research at BITS Pilani (2021 – 2024): LLM-driven legacy code modernization, privacy-preserving messaging middleware, and physics-informed neural networks for solar digital twins.

## Education

- MS in Computer Science, Georgia Institute of Technology (Aug 2026 – May 2028), GPA 4.0/4.0.
- BE in Computer Science, minor in Data Science, BITS Pilani, Goa Campus (2020 – 2024), CGPA 9.2/10.

## Skills

${PERSON.knowsAbout.join(', ')}.

## Projects

${projects
	.map((p) => `- [${p.title}](${p.github ?? url('/projects')}): ${p.built} Stack: ${p.tech.join(', ')}.`)
	.join('\n')}

## Pages

- [Home](${url('/')}): introduction and current work.
- [CV](${url('/cv')}): full education, experience, research, teaching, certifications, and skills.
- [Resume](${url('/resume')}): one-page resume ([PDF](${url('/Harsh_Gujarathi_Resume.pdf')})).
- [Projects](${url('/projects')}): projects with screenshots and source links.
- [Blog](${url('/blog/')}): posts.

## Blog posts

${posts.map((p) => `- [${p.data.title}](${url(`/blog/${p.id}/`)}): ${p.data.description}`).join('\n')}

## Elsewhere

${PERSON.sameAs.map((link) => `- ${link}`).join('\n')}
`;

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

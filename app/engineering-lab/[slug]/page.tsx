import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  engineeringProjects,
  getEngineeringProject,
} from "@/data/engineeringProjects";
import ProjectDetails from "../ProjectDetails";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const slugs = engineeringProjects.map(({ slug }) => ({ slug }));
  slugs.push({ slug: "project-orbital" });
  return slugs;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getEngineeringProject(slug);

  if (!project) return { title: "Project not found | Engineering Lab" };

  return {
    title: `${project.title} | Engineering Lab`,
    description: project.description,
  };
}

export default async function EngineeringProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params;
  const project = getEngineeringProject(slug);

  if (!project) notFound();

  const relatedProjects = (project.relatedProjectIds ?? [])
    .map((id) => engineeringProjects.find((candidate) => candidate.id === id))
    .filter((candidate) => candidate !== undefined);

  return (
    <ProjectDetails project={project} relatedProjects={relatedProjects} />
  );
}

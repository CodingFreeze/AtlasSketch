import type { RenderedArtifact } from "@/domain/renderers";
import { cn } from "@/lib/cn";

type ArtifactPreviewProps = {
  artifact: RenderedArtifact;
  className?: string;
  title?: string;
};

export function ArtifactPreview({ artifact, className, title }: ArtifactPreviewProps) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] min-h-0 overflow-hidden rounded border border-atlas-line bg-atlas-black",
        className,
      )}
    >
      <iframe
        className="h-full w-full border-0 bg-atlas-black"
        loading="lazy"
        sandbox=""
        srcDoc={artifact.html}
        title={title ?? artifact.title}
      />
    </div>
  );
}

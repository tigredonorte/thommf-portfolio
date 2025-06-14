import { IProject } from "@thommf-portfolio/config";
import "./Project.scss";
import { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Carousel } from "react-responsive-carousel";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface ProjectProps {
  project: IProject;
}

export const Project = ({ project }: ProjectProps) => {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openLightboxOnImage = (imageIndex: number) => {
    setIndex(imageIndex);
    setOpen(true);
  };

  const lightboxSlides = project.images.map((src) => ({ src }));
  const hasImages = project.images && project.images.length > 0;

  return (
    <>
      <div className={`project-card ${hasImages ? '' : 'no-image'}`}>
        {hasImages ? (
          <>
            <div className="project-carousel">
              <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop={true}
                useKeyboardArrows={true}
                emulateTouch={true}
                autoPlay={false}
              >
                {project.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    className="carousel-slide-container"
                    onClick={() => openLightboxOnImage(imageIndex)}
                  >
                    <LazyLoadImage
                      alt={`${project.title} screenshot ${imageIndex + 1}`}
                      src={image}
                      effect="blur"
                    />
                  </div>
                ))}
              </Carousel>
            </div>
            <div className="project-details">
              <h5>{project.title}</h5>
              <span className="industry-tag">{project.industry}</span>
              <p>{project.description}</p>
              <div className="tech-list">
                {project.tech.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="project-details full-width">
            <h5>{project.title}</h5>
            <span className="industry-tag">{project.industry}</span>
            <p>{project.description}</p>
            <div className="tech-list">
              {project.tech.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasImages && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          slides={lightboxSlides}
        />
      )}
    </>
  );
};
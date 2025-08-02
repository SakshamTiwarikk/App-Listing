"use client";

import React, { useState } from "react";
import Modal from "react-modal";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

type Props = {
  images: string[];
};

const ImageCarousel: React.FC<Props> = ({ images }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const openModal = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      {/* Thumbnail carousel */}
      <div className="flex gap-2 overflow-x-auto mb-3 pb-2">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={`Thumbnail ${i}`}
            onClick={() => openModal(i)}
            className="w-16 h-16 object-cover rounded flex-shrink-0 border border-gray-200 cursor-pointer hover:opacity-90"
          />
        ))}
      </div>

      {/* Full-screen modal carousel */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Full Image View"
        style={{
          content: {
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "black",
            padding: 0,
            border: "none",
            width: "90%",
            height: "90%",
          },
          overlay: { backgroundColor: "rgba(0,0,0,0.8)" },
        }}
        ariaHideApp={false}
      >
        <Carousel
          selectedItem={activeImageIndex}
          onChange={setActiveImageIndex}
          showThumbs={false}
          showStatus={false}
          infiniteLoop
        >
          {images.map((img, i) => (
            <div key={i} className="flex justify-center items-center h-full">
              <img
                src={img}
                alt={`Image ${i}`}
                className="max-h-[70vh] mx-auto object-contain"
              />
            </div>
          ))}
        </Carousel>
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded"
        >
          ✖ Close
        </button>
      </Modal>
    </div>
  );
};

export default ImageCarousel;

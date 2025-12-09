import React, { useState, useEffect } from "react";
import Timer from './Timer';
import Quotes from './Quotes';
import BackgroundWidget, { BackgroundProvider, BackgroundImage } from './Background';
import Sound from './Sound';
import TodoList from "./ToDoList";
import MaximizeButton from "./MaximizeButton";

const SoloStudy = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <BackgroundProvider>
      <div className="min-h-screen w-full relative" style={{ backgroundColor: 'transparent' }}>
        <BackgroundImage />
        
        <div className="relative p-4 md:p-6 lg:p-8 min-h-screen" style={{ zIndex: 10 }}>
          <div className="w-full h-full flex flex-col lg:flex-row gap-4 md:gap-6 justify-between">
            
            <div className="flex flex-col gap-4 md:gap-6 w-full lg:w-auto order-1">
              <div className="flex justify-start">
                <Timer />
              </div>
              
              <div className="flex justify-start">
                <TodoList />
              </div>
            </div>

            <div className="flex flex-col gap-4 md:gap-6 w-full lg:w-auto items-end order-2">
              
              <div className="flex justify-end">
                <MaximizeButton />
              </div>
              
              <div className="flex flex-row gap-4 md:gap-6 justify-end items-start flex-wrap">
                <Quotes />
                {!isFullscreen && (
                  <BackgroundWidget />
                )}
              </div>
              
              <div className="flex justify-end">
                <Sound isFullscreen={isFullscreen} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
};

export default SoloStudy;
import  { useEffect,useCallback } from 'react'

import { fabric } from 'fabric'

interface UseAutoSizeProps {
    canvas: fabric.Canvas | null;
    container: HTMLDivElement|null
}
const useAutoResize = ({canvas,container}:UseAutoSizeProps) => {
    const autoZoom  = useCallback(() => {
      if (!canvas || !container) {
        return;
      }

      const width = container.offsetWidth;
      const height = container.offsetHeight;
      canvas.setWidth(width);
      canvas.setHeight(height);
      const center = canvas.getCenter();
      const zoomRatio = 0.85;
      const localWorkSpace = canvas
        .getObjects()
        .find((object) => object.name === "clip");

      // @ts-expect-error just a type error

      const scale = fabric.util.findScaleToFit(localWorkSpace, {
        width,
        height,
      });
      
      const zoom = zoomRatio * scale;
      canvas.setViewportTransform(fabric.iMatrix.concat());
      canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);

      if (!localWorkSpace) return;

      const workSpaceCenter = localWorkSpace.getCenterPoint();
      const viewportTransform = canvas.viewportTransform;

      if (
        canvas.width === undefined ||
        canvas.height === undefined ||
        !viewportTransform
      ) {
        return;
      }

      viewportTransform[4] =
        canvas.width / 2 - workSpaceCenter.x * viewportTransform[0];

      viewportTransform[5] =
        canvas.height / 2 - workSpaceCenter.y * viewportTransform[3];

      canvas.setViewportTransform(viewportTransform);

      localWorkSpace.clone((cloned: fabric.Rect) => {
        canvas.clipPath = cloned;
        canvas.requestRenderAll();
      });
    },[canvas,container])

    useEffect(() => {
        let resizeObserver: ResizeObserver |null = null;
        if(canvas && container){
            resizeObserver = new ResizeObserver(() => {
                autoZoom()
                console.log("resized")
               
            })
            resizeObserver.observe(container)
        }
        return () => {
            if(resizeObserver){
                resizeObserver.disconnect()
            }
        }

 },[canvas,container,autoZoom])

 return {autoZoom}
 
}

export default useAutoResize
import * as turf from '@turf/turf'
import {Feature, Point, Polygon} from "@turf/helpers";

export class LocationUtil {
  static getCenterOfCircles = (circles:
                                 { lat: number, lon: number, radius: number }[]
  ): Feature<Polygon | null> | null => {
    const opt: any = {units: 'meters'};
    const c1 = turf.circle([circles[0].lon, circles[0].lat], circles[0].radius, opt);
    // if circles has 1 item, then return first
    if (circles.length === 1) {
      return c1;
    }
    const c2 = turf.circle([circles[1].lon, circles[1].lat], circles[1].radius, opt);
    if (circles.length === 2) {
      // if circles has 2 items
      const center = LocationUtil.centerOf2Circles(c1, c2);
      if (center) {
        return turf.circle(center, (circles[0].radius + circles[1].radius) / 2, opt)
      }
      // if 2 circles are not intersect then return first item
      return c1;
    }
    
    const centers: Feature<Point | null>[] = [];
    const center12: Feature<Point | null> | null = LocationUtil.centerOf2Circles(c1, c2);
    if (center12) {
      centers.push(center12);
    }
    else {
      // because there is not intersect between c1 and c2 so return c1
      return c1;
    }
    
    const c3 = turf.circle([circles[2].lon, circles[2].lat], circles[2].radius, opt);
    
    const center23: Feature<Point | null> | null = LocationUtil.centerOf2Circles(c2, c3);
    if (center23) {
      centers.push(center23);
    }
    else {
      return turf.circle(center12, (circles[0].radius + circles[1].radius) / 2, opt)
    }
    
    const center31: Feature<Point | null> | null = LocationUtil.centerOf2Circles(c3, c1);
    if (center31) {
      centers.push(center31);
    }
    else {
      return turf.circle(center12, (circles[0].radius + circles[1].radius) / 2, opt)
    }
    
    const features = turf.featureCollection([
      ...centers
    ]);
    const center = turf.center(features);
    if (center) {
      return turf.circle(center, 0.1, opt)
    }
    return null;
  };
  
  private static centerOf2Circles = (circle1: Feature<Polygon | null>, circle2: Feature<Polygon | null>): Feature<Point | null> | null => {
    const intersect = turf.intersect(circle1, circle2);
    if (intersect) {
      return turf.center(intersect);
    }
    return null;
  }
}
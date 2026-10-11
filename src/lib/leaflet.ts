// Loaded on demand so Leaflet (and its CSS) only downloads when a map is shown.
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default L;

/** SVG pin as a divIcon, avoiding Leaflet's default PNG marker paths, which break under bundlers. */
export const pinIcon = L.divIcon({
  className: 'map-pin',
  html: `<svg viewBox="0 0 24 32" width="30" height="40" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0Z" fill="#c9891a" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="4.5" fill="#fff"/></svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40]
});

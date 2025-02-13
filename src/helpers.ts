export function drawDefault(token, fillColor, p, aw, h, hh, w, hw, ah) {
   token.target
      .beginFill(fillColor, 1.0)
      .lineStyle(1, 0x000000)
      .drawPolygon([-p, hh, -p - aw, hh - ah, -p - aw, hh + ah])
      .drawPolygon([w + p, hh, w + p + aw, hh - ah, w + p + aw, hh + ah])
      .drawPolygon([hw, -p, hw - ah, -p - aw, hw + ah, -p - aw])
      .drawPolygon([hw, h + p, hw - ah, h + p + aw, hw + ah, h + p + aw]);
}

(() => {
  const vert = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform vec2 uMouse;
    uniform vec2 uRes;
    uniform vec2 uTexSize;
    uniform float uTime;
    uniform float uHover;
    uniform float uFit;

    vec2 fitUv(vec2 uv) {
      float ca = max(uRes.x, 1.0) / max(uRes.y, 1.0);
      float ia = max(uTexSize.x, 1.0) / max(uTexSize.y, 1.0);
      vec2 scale = vec2(1.0);
      if (uFit > 0.5) {
        // contain — full image visible
        if (ca > ia) scale = vec2(ia / ca, 1.0);
        else scale = vec2(1.0, ca / ia);
      } else {
        // cover
        if (ca > ia) scale = vec2(1.0, ca / ia);
        else scale = vec2(ia / ca, 1.0);
      }
      return (uv - 0.5) / scale + 0.5;
    }

    void main() {
      vec2 base = fitUv(vUv);
      if (base.x < 0.0 || base.x > 1.0 || base.y < 0.0 || base.y > 1.0) {
        gl_FragColor = vec4(0.027, 0.027, 0.039, 1.0);
        return;
      }

      vec2 uv = base;
      vec2 mouse = fitUv(vec2(uMouse.x, 1.0 - uMouse.y));
      vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
      vec2 delta = (uv - mouse) * aspect;
      float dist = length(delta);

      float liquid = exp(-dist * 7.5) * 0.085 * uHover;
      vec2 dir = dist > 0.0001 ? normalize(delta) : vec2(0.0);
      float ripple = sin(dist * 28.0 - uTime * 2.4) * 0.012 * smoothstep(0.42, 0.0, dist) * uHover;
      float drift = sin(uTime * 0.35 + uv.y * 4.0) * 0.004;

      uv += dir * (liquid + ripple);
      uv += vec2(drift, -drift * 0.5);
      uv = clamp(uv, 0.001, 0.999);

      vec4 color = texture2D(uTex, uv);
      float vignette = smoothstep(1.15, 0.35, dist + 0.35);
      color.rgb *= 0.78 + vignette * 0.22;
      gl_FragColor = color;
    }
  `;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  class LiquidStage {
    constructor(el) {
      this.el = el;
      this.src = el.dataset.liquid;
      this.fit = el.dataset.fit === "contain" ? 1 : 0;
      this.canvas = document.createElement("canvas");
      this.fallback = document.createElement("img");
      this.fallback.alt = "";
      this.fallback.src = this.src;
      if (this.fit) this.fallback.style.objectFit = "contain";
      el.appendChild(this.canvas);
      this.mouse = { x: 0.5, y: 0.5 };
      this.target = { x: 0.5, y: 0.5 };
      this.hover = 0;
      this.hoverTarget = 0;
      this.visible = false;
      this.time = 0;
      this.texSize = { x: 1, y: 1 };
      this.ok = this.initGL();
      if (!this.ok) {
        this.canvas.remove();
        el.appendChild(this.fallback);
        return;
      }
      this.bind();
      this.resize();
    }

    initGL() {
      const gl = this.canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
      if (!gl) return false;
      this.gl = gl;
      const vs = compile(gl, gl.VERTEX_SHADER, vert);
      const fs = compile(gl, gl.FRAGMENT_SHADER, frag);
      if (!vs || !fs) return false;
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
      this.prog = prog;
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "aPos");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      this.uniforms = {
        uTex: gl.getUniformLocation(prog, "uTex"),
        uMouse: gl.getUniformLocation(prog, "uMouse"),
        uRes: gl.getUniformLocation(prog, "uRes"),
        uTexSize: gl.getUniformLocation(prog, "uTexSize"),
        uTime: gl.getUniformLocation(prog, "uTime"),
        uHover: gl.getUniformLocation(prog, "uHover"),
        uFit: gl.getUniformLocation(prog, "uFit"),
      };
      this.texture = gl.createTexture();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.texSize = { x: img.naturalWidth || img.width || 1, y: img.naturalHeight || img.height || 1 };
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.ready = true;
      };
      img.src = this.src;
      return true;
    }

    bind() {
      const section =
        this.el.closest(".ah-story, .ah-page-hero, .ah-media-frame, .ah-service-banner, section") ||
        this.el.parentElement ||
        this.el;
      section.addEventListener("pointermove", (e) => {
        const r = this.el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        this.target.x = (e.clientX - r.left) / r.width;
        this.target.y = (e.clientY - r.top) / r.height;
        this.hoverTarget = 1;
      });
      section.addEventListener("pointerleave", () => {
        this.hoverTarget = 0;
      });
      this.io = new IntersectionObserver(
        (entries) => {
          this.visible = entries[0].isIntersecting;
        },
        { threshold: 0.05 }
      );
      this.io.observe(section);
      window.addEventListener("resize", () => this.resize());
    }

    resize() {
      const r = this.el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      this.canvas.width = Math.max(2, Math.floor(r.width * dpr));
      this.canvas.height = Math.max(2, Math.floor(r.height * dpr));
      this.canvas.style.width = r.width + "px";
      this.canvas.style.height = r.height + "px";
      if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    update(dt) {
      if (!this.ok || !this.visible || !this.ready) return;
      this.mouse.x += (this.target.x - this.mouse.x) * 0.08;
      this.mouse.y += (this.target.y - this.mouse.y) * 0.08;
      this.hover += (this.hoverTarget - this.hover) * 0.06;
      this.time += dt;
      const gl = this.gl;
      gl.useProgram(this.prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.uniform1i(this.uniforms.uTex, 0);
      gl.uniform2f(this.uniforms.uMouse, this.mouse.x, this.mouse.y);
      gl.uniform2f(this.uniforms.uRes, this.canvas.width, this.canvas.height);
      gl.uniform2f(this.uniforms.uTexSize, this.texSize.x, this.texSize.y);
      gl.uniform1f(this.uniforms.uTime, this.time);
      gl.uniform1f(this.uniforms.uHover, this.hover);
      gl.uniform1f(this.uniforms.uFit, this.fit);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }

  function boot() {
    const nodes = [...document.querySelectorAll("[data-liquid]")].filter((el) => !el.__ahLiquid);
    const stages = nodes.map((el) => {
      el.__ahLiquid = true;
      return new LiquidStage(el);
    });
    if (!stages.length) return;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      stages.forEach((s) => s.update(dt));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  window.AhLiquidBoot = boot;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 120));
  } else {
    setTimeout(boot, 120);
  }
})();

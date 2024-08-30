import InternalParticles, { initParticlesEngine } from "@tsparticles/react";
import { type ISourceOptions } from "@tsparticles/engine";
import { loadSnowPreset } from "@tsparticles/preset-snow";
import { observable, observableBox, runInAction } from "@fobx/core";
import { observer } from "@fobx/react";
import "./screenParticles.css";

export async function Initialize() {
  await initParticlesEngine(async (engine) => {
    await loadSnowPreset(engine);
  });
  runInAction(() => {
    particlesLoaded.value = true;
  });
}

const particlesLoaded = observableBox(false);

const particlesOptions = observable({
  background: {},
  fullScreen: {
    zIndex: 9995,
  },
  fpsLimit: 120,
  particles: {
    move: {
      speed: 0.25,
      direction: "bottom",
      enable: true,
      outModes: {
        bottom: "out",
        left: "out",
        right: "out",
        top: "out",
        default: "out",
      },
    },
    number: {
      density: {
        enable: true,
      },
      value: 10,
    },
    opacity: {
      random: {
        enable: true,
      },
      value: {
        min: 0.1,
        max: 0.5,
      },
    },
    size: {
      random: {
        enable: true,
      },
      value: {
        min: 1,
        max: 5,
      },
    },
  },
} as ISourceOptions);

export const Particles = observer(() => {
  return (
    particlesLoaded.value && (
      <InternalParticles id="tsparticles" options={particlesOptions} />
    )
  );
});

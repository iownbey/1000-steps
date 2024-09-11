export type StagePropProps = {
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const StageProp = ({ image, x, y, width, height }: StagePropProps) => {
  return (
    <div
      className="ground-prop"
      style={{
        backgroundImage: `url(${image})`,
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    />
  );
};

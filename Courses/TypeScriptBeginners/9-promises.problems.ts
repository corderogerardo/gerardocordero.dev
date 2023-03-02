interface LukeSkywalker {
  name: string;
  height: string;
  mass: string;
  hair_color: string;
  skin_color: string;
  eye_color: string;
  birth_year: string;
  gender: string;
}

export const fetchLukeSkywalker = async (): Promise<LukeSkywalker> => {
  // You can also set data as LukeSkywalker which is safer way.
  const data = await fetch("https://swapi.dev/api/people/1").then((res) => {
    return res.json();
  });

  // you can cast data with 'AS' instead with LukeSkywalker, this enforces that data is always LukeSkywalker
  return data;
};

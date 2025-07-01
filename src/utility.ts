export function do_<A>(k: () => A) {
  return k();
}

export function stringify(x: any) {
  return JSON.stringify(x, null, 4);
}

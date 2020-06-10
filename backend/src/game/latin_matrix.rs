use std::vec::Vec;
use rand::Rng;
use rand::seq::SliceRandom; // 0.7.2

/// Generates a latin matrix using the Jacobson-Matthews algorithm
///
/// Source code taken from and adapted into Rust:
/// https://github.com/RAMPKORV/jacobson-matthews-latin-square-js/blob/master/getRandomLatinSquare.js
///
pub fn generate_latin_matrix(n: usize) -> Vec<Vec<usize>> {
    let mut rng = rand::thread_rng();
    let min_iterations: usize = std::cmp::min(n * n * n, 1000);

    let identity_matrix: Vec<Vec<i8>> = (0..n)
        .map(|i| (0..n).map(|j| (i == j) as i8).collect())
        .collect();

    let mut cube: Vec<Vec<Vec<i8>>> = identity_matrix.iter()
        .enumerate()
        .map(|(i, r)| {
            let mut a1 = identity_matrix[i..n].to_vec();
            let a2 = identity_matrix[0..i].to_vec();
            a1.extend(a2);
            a1
        })
        .collect();

    let mut improper_cell: Option<Vec<usize>> = None;

    let mut i: usize = 0;
    while improper_cell.is_some() || i < min_iterations {
        let t: Vec<usize> = match improper_cell.clone() {
            None => {
                loop {
                    let t: Vec<usize> = std::iter::repeat_with(|| rng.gen_range(0, n))
                        .take(3)
                        .collect::<Vec<_>>();

                    if cube[t[0]][t[1]][t[2]] == 0 {
                        break t;
                    }
                }
            }
            Some(cell) => {
                cell
            }
        };

        let c: Vec<usize> = match improper_cell.clone() {
            None => vec![
                cube.iter().enumerate().find(|e| e.1[t[1]][t[2]] != 0)
                    .map(|e| e.0).unwrap(),
                cube[t[0]].iter().enumerate().find(|e| e.1[t[2]] != 0)
                    .map(|e| e.0).unwrap(),
                cube[t[0]][t[1]].iter().enumerate().find(|e| *e.1 != 0)
                    .map(|e| e.0).unwrap()
            ],
            Some(_) => {
                let mut candidates: Vec<Vec<usize>> = vec![vec![]; 3];
                for j in 0..n {
                    if cube[j][t[1]][t[2]] == 1 { candidates[0].push(j) }
                    if cube[t[0]][j][t[2]] == 1 { candidates[1].push(j) }
                    if cube[t[0]][t[1]][j] == 1 { candidates[2].push(j) }
                }
                candidates.iter()
                    .map(|c| *c.choose(&mut rng).unwrap())
                    .collect()
            }
        };

        cube[t[0]][t[1]][t[2]] += 1;
        cube[t[0]][c[1]][c[2]] += 1;
        cube[c[0]][c[1]][t[2]] += 1;
        cube[c[0]][t[1]][c[2]] += 1;
        cube[t[0]][t[1]][c[2]] -= 1;
        cube[t[0]][c[1]][t[2]] -= 1;
        cube[c[0]][t[1]][t[2]] -= 1;
        cube[c[0]][c[1]][c[2]] -= 1;

        if cube[c[0]][c[1]][c[2]] == -1 {
            improper_cell = Some(c);
        } else {
            improper_cell = None;
        }

        i += 1;
    }

    let mut square: Vec<Vec<usize>> = vec![vec![0;n];n];

    for (x, v1) in cube.iter().enumerate() {
        for (y, v2) in v1.iter().enumerate() {
            square[x][y] = v2.iter().enumerate().find(|v| *v.1 == 1).unwrap().0;
        }
    }

    square.sort_by(|a,b| a[0].partial_cmp(&b[0]).unwrap());

    square
}

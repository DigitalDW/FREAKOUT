/* Voici le kit de lancement Kaboom js pour cette journée !

Voici quelques ressources pour vous aider
La documentation de Kaboom : https://kaboomjs.com/
Des codes d'exemple : https://kaboomjs.com/play?demo=add

Kaboom dispose de plusieurs fonctions pour créer de l'alétoire !
rand(), mais aussi randi(), choose(), chance(), randSeed()...
Et il y a bien d'autres manières de provoquer de l'incertitude !

Bon codage !

Isaac Pante

*/

// l'objet Kaboom
// définissez les propriétés générales ici
kaboom({
  background: [0, 0, 0],
  width: 1200,
  height: 800,
});

const DEFAULT_SPEED = 600;

randSeed(22071997);

// définir un chemin racine pour les ressources
// Ctte étape est facultative, elle sert juste
// à raccourcir les chemins suivants
loadRoot('assets/');

// charger les images
loadSprite('tuile', 'images/tuile.png');
loadSprite('coeur', 'images/coeur.png');

// charger les sons
loadSound('menuMusic', 'audio/before_the_dawn.ogg');
loadSound('gameMusic', 'audio/Iwan Gabovitch - Dark Ambience Loop.ogg');
loadSound('reussite', 'audio/THUD_Bright_01_mono.wav');
loadSound('echec', 'audio/echec.wav');
loadSound('quake', 'audio/EXPLOSION_Distorted_03_Long_stereo.wav');
loadSound('riser', 'audio/PM_FSSF2_XTRAS_RISERS_1.wav');
loadSound('thunder', 'audio/SHOCK_RIFLE_Clap_Thunder_Tail_01_mono.wav');
loadSound('bomb', 'audio/FIREWORKS_Rocket_Explode_Distant_mono.wav');
loadSound('slow', 'audio/CHARGE_Sci-Fi_High_Pass_Sweep_12_Semi_Down_500ms_stereo.wav');
loadSound('accel', 'audio/CHARGE_Sci-Fi_High_Pass_Sweep_12_Semi_Up_500ms_stereo.wav');

// déclaration d'une scène
// les scènes découpent le jeu
scene('accueil', () => {
  // lancer la musique
  const musique = play('menuMusic');
  add([
    // créer un objet texte
    // le second paramètre permet de modifier son style
    text("Appuyez sur la barre d'espace pour jouer !", {
      width: 800,
    }),
    // placer le point d'accroche au centre
    origin('center'),
    // placer le texte au centre
    pos(center()),
  ]);
  // ajout de plusieurs textes affichés aléatoirement
  // ici, on lancer une boucle tooutes les ½ secondes
  loop(0.5, () => {
    add([
      // le texte est tiré aléatoirement dans ce tableau
      text(choose(['Loic', 'Loris']), {
        width: 800,
        font: 'sink',
        size: 48,
      }),
      // la couleur est ajoutée en rgb (red, green, blue)
      // on tire à chaque fois nombre entre 0 et 255
      // randi() garantit qu'il s'agit d'un entier
      // au contraire de rand()
      color(randi(0, 255), randi(0, 255), randi(0, 255)),
      origin('center'),
      pos(randi(0, width()), randi(height() - 10, height() - 200)),
    ]);
  });

  // ajout d'un événement pour lancer l'autre scène
  onKeyPress('space', () => {
    // charger la scène "jeu"
    go('jeu');
    musique.stop();
  });
});

// déclaration de la scène de jeu
scene('jeu', () => {
  // initialisation des variables globales
  // score à zéro et vies à 3
  let score = 0;
  let vies = 3;
  let vitesse = DEFAULT_SPEED;

  const musique = play('gameMusic', {
    seek: 4.822,
    loop: true,
  });

  // dessiner un niveau
  addLevel(
    [
      '==============',
      '==============',
      '==============',
      '==============',
      '==============',
      '==============',
      '==============',
    ],
    {
      // définir la taille de chaque élément
      width: 65,
      height: 33,
      // définir où positionner le début de la grille
      pos: vec2(100, 200),
      // associer chaque symbole à un composant
      '=': () => [
        // joindre le sprite
        sprite('tuile'),
        // modifier sa couleur
        color(255, 255, 255),
        // ajouter une bordure
        outline(4, 10),
        origin('center'),
        // donner une hitbox
        area(),
        // rendre l'élément réactif aux collisions
        solid(),
        // lui donner un identifiant
        // pour les interactions à venir
        'brique',
      ],
    }
  );

  // Changer certaines briques pour un comprtement spécial
  mutateSpecials();

  //  Boucle temporelle qui change les aléatoirement les briques
  loop(9.599, () => {
    mutateSpecials();
  });

  // le palet
  const palet = add([
    pos(vec2(width() / 2 - 40, height() - 40)),
    rect(120, 20),
    outline(4),
    origin('center'),
    area(),
    'paddle',
  ]);

  // le texte pour le score
  add([
    text(score, {
      font: 'sink',
      size: 48,
    }),
    pos(100, 100),
    origin('center'),
    z(50),
    // lier le texte au score
    // et le faire évoluer en fonction
    {
      update() {
        this.text = score;
      },
    },
    // notez que ce bloc est un simple objet
    // ajouter à notre composant de score
  ]);

  // vérifier le mouvement du paddle 60 fois par
  // seconde et y associer le mouvement de la souris
  onUpdate('paddle', (p) => {
    p.pos.x = mousePos().x;
  });

  // ajouter la balle
  const ball = add([
    pos(width() / 2, height() - 55),
    // créer un cercle de rayon 16
    circle(16),
    outline(4),
    area({
      width: 32,
      height: 32,
      offset: vec2(-16),
    }),
    {
      // dir extrait le vecteur de direction
      // à partir d'un angle donné
      velocite: dir(rand(-60, -40)),
      // notez que nous définissons velocite ici
      // il n'appartient pas au langage
    },
  ]);

  // dès que la balle "change"
  // on effectue un certain nombre de tests
  ball.onUpdate(() => {
    // déplacer la balle
    ball.move(ball.velocite.scale(vitesse));
    // gérer les rebonds sur les murs latéraux...
    if (ball.pos.x < 0 || ball.pos.x > width()) {
      // et renvoyer la balle
      ball.velocite.x = -ball.velocite.x;
    }
    // si la balle tape au sommet...
    if (ball.pos.y < 0) {
      // elle repart dans l'autre sens
      ball.velocite.y = -ball.velocite.y;
    }
    // gérer le cas où la balle sort par le bas
    if (ball.pos.y > height() + 60) {
      // secouer l'écran
      shake(30);
      play('echec');
      // réinitialiser la balle, sa vitesse, etc.
      ball.pos.x = width() / 2;
      ball.pos.y = height() - 55;
      //vitesse = 320;
      ball.velocite = dir(rand(220, 290));
      // diminuer les vies
      vies--;
      // s'il n'y en a plus...
      if (vies == 0) {
        // appel de la scène d'échec
        // et passage d'un paramètre qui sera récupéré
        // dans cette scène
        musique.stop();
        go('ohno', { score: score });
      }
    }
  });

  // gérer les collisions
  // avec le paddle
  ball.onCollide('paddle', (p) => {
    vitesse += 0;
    // renvoyer la balle avec le bon angle
    ball.velocite = dir(ball.pos.angle(p.pos));
  });

  // avec tous les types de briques
  // grâce à l'identifiant "brique"
  ball.onCollide('standard', (b) => {
    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));
    
    play('reussite');

    // augmenter le score
    score++;
  });

  // avec les briques spéciales
  // grâce à l'identifiant "special"
  ball.onCollide('fall', (b) => {
    // Bounce only
    ball.velocite = dir(ball.pos.angle(b.pos));

    play('reussite');

    b.use(body());
    b.onCollide('paddle', (p) => {
      shake(30);
      play('echec');
      vies--;
    });

    // augmenter le score
    score++;
  });

  ball.onCollide('bomb', (b) => {
    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));

    play('bomb');

    ball.use(scale(3));
    wait(0.02, () => {
      ball.use(scale(1));
    });

    // augmenter le score
    score++;
  });

  ball.onCollide('slowdown', (b) => {
    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));
    
    play('slow');

    vitesse = 400;
    wait(5, () => {
      vitesse = DEFAULT_SPEED;
    });

    // augmenter le score
    score++;
  });

  ball.onCollide('accelerate', (b) => {
    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));
    
    play('accel');

    vitesse = 800;
    wait(5, () => {
      vitesse = DEFAULT_SPEED;
    });

    // augmenter le score
    score++;
  });

  ball.onCollide('quake', (b) => {
    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));
    
    play('quake');

    shake(300);
    b.destroy();
    every('brique', (b) => {
      b.pos.x = b.pos.x + rand(-50, 50);
      b.pos.y = b.pos.y + rand(-50, 50);
    });
    ball.velocite = dir(ball.pos.angle(b.pos));

    // augmenter le score
    score++;
  });

  ball.onCollide('doppelganger', (b) => {
    play('riser');

    // Destroy and bounce
    b.destroy();
    ball.velocite = dir(ball.pos.angle(b.pos));

    let posX = 0;
    if (ball.pos.x - 50 < 0) {
      posX = ball.pos.x + 50;
    } else if (ball.pos.x + 50 > width()) {
      posX = ball.pos.x - 50;
    }
    wait (3.5, () => {
      play('thunder');

      let ball2 = add([
        pos(posX, 50),
        // créer un cercle de rayon 16
        circle(16),
        outline(4),
        area({
          width: 32,
          height: 32,
          offset: vec2(-16),
        }),
        {
          // dir extrait le vecteur de direction
          // à partir d'un angle donné
          velocite: dir(rand(-80, 80)),
          // notez que nous définissons velocite ici
          // il n'appartient pas au langage
        },
      ]);
      ball2.onUpdate(() => {
        // déplacer la balle
        ball2.move(ball2.velocite.scale(vitesse));
        // gérer les rebonds sur les murs latéraux...
        if (ball2.pos.x < 0 || ball2.pos.x > width()) {
          // et renvoyer la balle
          ball2.velocite.x = -ball2.velocite.x;
        }
        // si la balle tape au sommet...
        if (ball2.pos.y < 0) {
          // elle repart dans l'autre sens
          ball2.velocite.y = -ball2.velocite.y;
        }
      });
      ball2.onCollide('brique', (b) => {
        // augmenter le score
        score++;
        ball2.velocite = dir(ball2.pos.angle(b.pos));
      });
    })
  });


  ball.onCollide('radionucleide', (b) => {
    // play('quake');
    ball.velocite = dir(ball.pos.angle(b.pos));

    wait(5, () => b.destroy());

    for (let i = 0; i < 5; i++) {
      wait(i, () => {
        let ballR = add([
          pos(b.pos.x, b.pos.y),
          // créer un cercle de rayon 16
          circle(16),
          outline(4),
          color(77, 255, 77),
          opacity(0.6),
          area({
            width: 32,
            height: 32,
            offset: vec2(-16),
          }),
          {
            // dir extrait le vecteur de direction
            // à partir d'un angle donné
            velocite: dir(rand(-80, 80)),
            // notez que nous définissons velocite ici
            // il n'appartient pas au langage
          },
        ]);
        ballR.onUpdate(() => {
          // déplacer la balle
          ballR.move(ballR.velocite.scale(vitesse));
          // gérer les rebonds sur les murs latéraux...
          if (ballR.pos.x < 0 || ballR.pos.x > width()) {
            // et renvoyer la balle
            ballR.velocite.x = -ballR.velocite.x;
          }
          // si la balle tape au sommet...
          if (ballR.pos.y < 0) {
            // elle repart dans l'autre sens
            ballR.velocite.y = -ballR.velocite.y;
          }
        });
        // gérer le cas où la balle sort par le bas
        if (ballR.pos.y > height() + 60) {
          // secouer l'écran
          shake(30);
          play('echec');
          // réinitialiser la balle, sa vitesse, etc.
          ballR.pos.x = width() / 2;
          ballR.pos.y = height() - 55;
          //vitesse = 320;
          ballR.velocite = dir(rand(220, 290));
          // diminuer les vies
          vies--;
          console.log(vies);
          // s'il n'y en a plus...
          if (vies == 0) {
            // appel de la scène d'échec
            // et passage d'un paramètre qui sera récupéré
            // dans cette scène
            musique.stop();
            go('ohno', { score: score });
          }
        }
        ballR.onCollide('paddle', (p) => {
          vitesse += 0;
          // renvoyer la balle avec le bon angle
          ballR.velocite = dir(ballR.pos.angle(p.pos));
        });
        ballR.onCollide('brique', (b) => {
          // augmenter le score

          if (!b.is('radionucleide')) {
            score++;
            b.destroy();
          }
          ballR.velocite = dir(ballR.pos.angle(b.pos));
        });
        wait(5, () => ballR.destroy());
      });
    }
  });
});

// déclaration de la scène d'échec
scene('ohno', ({ score }) => {
  add([
    text(`Vous avez perdu... \net fait ${score} points !`, { width: width() }),
    origin('center'),
    pos(center()),
  ]);
  onKeyPress('space', () => {
    go('accueil');
  });
});

// lancer le jeu
go('accueil');

/* Voilà, vous êtes au bout de la lecture de ce script !
A ce stade, je vous recommande de survoler l'entier
de la documentation Kaboom (elle est courte !).
Cela vous donnera un bon aperçu du système.

Et ensuite, pourquoi ne pas commencer par afficher les vies ?
D'ailleurs, une image "coeur.png" vous attend dans les assets.

Et ensuite, vous pourrez vous attacher aux conditions de victoire,
en faisant la part belle à l'incertitude !

*/

function mutateSpecials() {
  // Remove animation loops (radionucleide)
  loopCancelers.forEach((l) => l());

  // S B A D F Q P R
  every('brique', (b) => {
    b.use(color(255, 255, 255));
    b.unuse(body());
    if (b.is('slowdown')) {
      b.unuse('slowdown');
    } else if (b.is('accelerate')) {
      b.unuse('accelerate');
    } else if (b.is('bomb')) {
      b.unuse('bomb');
    } else if (b.is('doppelganger')) {
      b.unuse('doppelganger');
    } else if (b.is('fall')) {
      b.unuse('fall');
    } else if (b.is('quake')) {
      b.unuse('quake');
    } else if (b.is('pinball')) {
      b.unuse('pinball');
    } else if (b.is('radionucleide')) {
      b.use(rotate(0));
      b.unuse('radionucleide');
    } else if (b.is('standard')) {
      b.unuse('standard');
    }
    if (chance(0.25)) {
      const type = choose([
        'slowdown',
        'slowdown',
        'slowdown',
        'accelerate',
        'accelerate',
        'accelerate',
        'bomb',
        'bomb',
        'bomb',
        'doppelganger',
        'doppelganger',
        'doppelganger',
        'fall',
        'quake',
        'pinball',
        'radionucleide',
      ]);

      b.use(type);
      if (b.is('slowdown')) {
        b.use(color(36, 20, 159));
      } else if (b.is('accelerate')) {
        b.use(color(205, 14, 14));
      } else if (b.is('bomb')) {
        b.use(color(193, 137, 16));
      } else if (b.is('doppelganger')) {
        b.use(color(0, 255, 255));
      } else if (b.is('fall')) {
        b.use(color(50, 50, 50));
      } else if (b.is('quake')) {
        b.use(color(153, 102, 51));
      } else if (b.is('pinball')) {
        b.use(color(158, 158, 158));
      } else if (b.is('radionucleide')) {
        loopCancelers.push(loop(0.05, () => {
          b.use(rotate(rand(5)));
        }));
        b.use(color(77, 255, 77));
      }
    } else {
      b.use('standard');
      b.use(color(255, 255, 255));
    }
  });
}

const loopCancelers = [];

const brickTypes = [
  'slowdown',
  'accelerate',
  'bomb',
  'doppelganger',
  'fall',
  'quake',
  'pinball',
  'radionucleide',
];

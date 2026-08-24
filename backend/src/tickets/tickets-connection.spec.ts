import { beforeEach, describe, expect, it, vi } from 'vitest';

import { closeTicketsConnection, resolveTicketsConnection } from './tickets-connection';

/** Faux objets de connexion : on vérifie lequel est retourné, pas ce qu'il fait. */
const defaultConn = { name: 'principale' } as never;
const remoteConn = { name: 'tickets', close: vi.fn() } as never;

describe('resolveTicketsConnection', () => {
  // La connexion est mémorisée au niveau du module — c'est justement ce qu'on
  // teste ici, donc chaque cas repart d'une ardoise vierge.
  beforeEach(async () => {
    await closeTicketsConnection();
  });

  it('reste sur la connexion principale quand aucune URI n’est fournie', () => {
    const create = vi.fn();

    expect(resolveTicketsConnection(defaultConn, '', create)).toBe(defaultConn);
    expect(create).not.toHaveBeenCalled();
  });

  it('ignore une URI vide de blancs', () => {
    // Une variable d'environnement laissée à «   » ne doit pas ouvrir une
    // connexion vers nulle part au démarrage.
    const create = vi.fn();

    expect(resolveTicketsConnection(defaultConn, '   ', create)).toBe(defaultConn);
    expect(create).not.toHaveBeenCalled();
  });

  it('ouvre une connexion dédiée quand une URI est fournie', () => {
    const create = vi.fn().mockReturnValue(remoteConn);

    expect(resolveTicketsConnection(defaultConn, 'mongodb://ailleurs/backlog', create)).toBe(
      remoteConn,
    );
    expect(create).toHaveBeenCalledWith('mongodb://ailleurs/backlog');
  });

  it('n’ouvre qu’une seule connexion, même appelé plusieurs fois', () => {
    // Les modèles Ticket et Counter la demandent tous les deux : deux connexions
    // vers la même base gaspilleraient un pool et fausseraient le compteur.
    const create = vi.fn().mockReturnValue(remoteConn);
    const uri = 'mongodb://ailleurs/backlog';

    resolveTicketsConnection(defaultConn, uri, create);
    resolveTicketsConnection(defaultConn, uri, create);

    expect(create).toHaveBeenCalledTimes(1);
  });
});

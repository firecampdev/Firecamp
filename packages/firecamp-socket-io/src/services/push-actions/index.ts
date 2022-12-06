import {
  IUrl,
  ISocketIOConfig,
  TId,
  ISocketIOConnection,
  ISocketIOEmitter,
  IRequestFolder,
  EPushActionType,
} from '@firecamp/types';
import equal from 'deep-equal';
import CleanDeep from 'clean-deep';

import {
  IPushActionConnections,
  IPushActionEmitter,
  IPushActionDirectory,
} from '../../types';
import { _array, _object } from '@firecamp/utils';

// TODO: add enums for push action types

const PushActionService = {
  prepareUrlPushAction: (
    lastUrl: IUrl,
    url: IUrl,
    existingPushAction?: Array<string>
  ) => {
    let pushAction: Array<string> = existingPushAction || [];

    if (!lastUrl || !url) return [];

    for (let key in url) {
      if (!equal(lastUrl[key], url[key])) {
        /**
         * Push url key in push action
         * If updated url and lastUrl value are not same
         */
        pushAction.push(key);
      } else if (pushAction?.includes(key) && equal(lastUrl[key], url[key])) {
        pushAction = _array.without(pushAction, key);
      }
    }

    return _array.uniq(pushAction);
  },

  prepareMetaPushAction: (
    lastMeta: any,
    meta: any,
    existingPushAction?: Array<string>
  ) => {
    let pushAction: Array<string> = existingPushAction || [];

    if (!lastMeta || !meta) return [];

    for (let key in meta) {
      if (!equal(lastMeta[key], meta[key])) {
        /**
         * Push meta key in push action
         * If updated meta and lastMeta value are not same
         */
        pushAction.push(key);
      } else if (pushAction.includes(key) && equal(lastMeta[key], meta[key])) {
        pushAction = _array.without(pushAction, key);
      }
    }

    return _array.uniq(pushAction);
  },

  prepareRootPushAction: (
    last_root: any,
    _root: any,
    existingPushAction?: Array<string>
  ) => {
    let pushAction: Array<string> = existingPushAction || [];

    if (!last_root || !_root) return [];

    for (let key in _root) {
      if (!equal(last_root[key], _root[key])) {
        /**
         * Push _root key in push action
         * If updated _root and last_root value are not same
         */
        pushAction.push(key);
      } else if (
        pushAction.includes(key) &&
        equal(last_root[key], _root[key])
      ) {
        pushAction = _array.without(pushAction, key);
      }
    }

    return _array.uniq(pushAction);
  },

  prepareConfigPushAction: (
    lastConfig: ISocketIOConfig,
    config: ISocketIOConfig,
    existingPushAction?: Array<string>
  ) => {
    let pushAction: Array<string> = existingPushAction || [];

    if (!lastConfig || !config) return [];

    for (let key in config) {
      if (!equal(lastConfig[key], config[key])) {
        /**
         * Push config key in push action
         * If updated config and lastConfig value are not same
         */
        pushAction.push(key);
      } else if (
        pushAction.includes(key) &&
        equal(lastConfig[key], config[key])
      ) {
        pushAction = _array.without(pushAction, key);
      }
    }

    return _array.uniq(pushAction);
  },

  prepare_MetaPushAction: (
    last_Meta: any,
    _meta: any,
    existingPushAction?: Array<string>
  ) => {
    let pushAction: Array<string> = existingPushAction || [];
    if (!last_Meta || !_meta) return [];

    for (let key in _meta) {
      if (!equal(last_Meta[key], _meta[key])) {
        /**
         * Push _meta key in push action
         * If updated _meta and last_Meta value are not same
         */
        pushAction.push(key);
      } else if (
        pushAction.includes(key) &&
        equal(last_Meta[key], _meta[key])
      ) {
        pushAction = _array.without(pushAction, key);
      }
    }

    return _array.uniq(pushAction);
  },

  prepareRequestConnectionsPushAction: (
    connectionId: TId,
    pushActionType: EPushActionType,
    lastConnection: ISocketIOConnection,
    connection: ISocketIOConnection,
    existingPushAction?: IPushActionConnections
  ) => {
    let pushAction: IPushActionConnections = existingPushAction || {};

    // INSERT
    if (pushActionType === EPushActionType.Insert) {
      pushAction[pushActionType] = _array.uniq([
        ...(pushAction[pushActionType] || []),
        connectionId,
      ]);
    }

    // UPDATE
    else if (pushActionType === EPushActionType.Update) {
      if (
        (pushAction[EPushActionType.Insert] &&
          !pushAction[EPushActionType.Insert]?.includes(connectionId)) ||
        !pushAction[EPushActionType.Insert]
      ) {
        // Get existing push action from connectionId
        let existingConnectionCAIndex = pushAction?.[pushActionType]?.findIndex(
          (c) => c.id === connectionId
        );

        let connectionUpdatedCA = pushAction?.[pushActionType]?.[
          existingConnectionCAIndex
        ] || { id: connectionId };

        for (let key in connection) {
          // For headers and queryParams add in to key '_root'
          if (!equal(connection[key], lastConnection[key])) {
            connectionUpdatedCA['_root'] = _array.uniq([
              ...(connectionUpdatedCA?.['_root'] || []),
              key,
            ]);
          } else if (connectionUpdatedCA?.['_root']?.includes(key)) {
            // If already exist in push action and having same value then remove from updated push action
            connectionUpdatedCA['_root'] = _array.without(
              connectionUpdatedCA?.['_root'],
              key
            );
          }

          if (_object.size(_object.omit(connectionUpdatedCA, ['id']))) {
            if (
              existingConnectionCAIndex !== undefined &&
              existingConnectionCAIndex !== -1
            ) {
              pushAction[pushActionType][existingConnectionCAIndex] =
                connectionUpdatedCA;
            } else {
              pushAction[pushActionType] = [
                ...(pushAction?.[pushActionType] || []),
                connectionUpdatedCA,
              ];
            }
          } else if (pushAction[pushActionType]) {
            pushAction[pushActionType] = pushAction?.[pushActionType].filter(
              (c) => c.id !== connectionId
            );
          }
        }
      }
    }

    // DELETE
    else {
      // check if in instert and delete both, if true then remove
      if (
        pushAction[EPushActionType.Insert] &&
        pushAction[EPushActionType.Insert]?.includes(connectionId)
      ) {
        pushAction[EPushActionType.Insert] = _array.without(
          pushAction[EPushActionType.Insert],
          connectionId
        );
      } else {
        // check if in udpate and delete both, if true then remove
        if (
          pushAction[EPushActionType.Update] &&
          pushAction[EPushActionType.Update]?.find((c) => c.id === connectionId)
        ) {
          pushAction[EPushActionType.Update] = pushAction[
            EPushActionType.Update
          ].filter((c) => c.id === connectionId);
        }

        // Add connectionId in delete
        pushAction[pushActionType] = _array.uniq([
          ...(pushAction?.[pushActionType] || []),
          connectionId,
        ]);
      }
    }

    // console.log({ pushAction });

    return CleanDeep(pushAction);
  },

  prepareCollectionEmittersPushAction: (
    emitter_id: TId,
    pushActionType: EPushActionType,
    lastEmitter: ISocketIOEmitter,
    emitter: ISocketIOEmitter,
    existingPushAction?: IPushActionEmitter
  ) => {
    let pushAction: IPushActionEmitter = existingPushAction || {};

    // INSERT
    if (pushActionType === EPushActionType.Insert) {
      pushAction[pushActionType] = _array.uniq([
        ...(pushAction[pushActionType] || []),
        emitter_id,
      ]);
    }

    // UPDATE
    else if (pushActionType === EPushActionType.Update) {
      if (
        (pushAction[EPushActionType.Insert] &&
          !pushAction[EPushActionType.Insert]?.includes(emitter_id)) ||
        !pushAction[EPushActionType.Insert]
      ) {
        // Get existing push action from emitter_id
        let existingEmitterCAIndex = pushAction?.[pushActionType]?.findIndex(
          (m) => m?.id === emitter_id
        );

        let emitterUpdatedCA = pushAction?.[pushActionType]?.[
          existingEmitterCAIndex
        ] || { id: emitter_id };

        for (let key in emitter) {
          if (key === 'name' || key === 'body') {
            // For name and body add in to key '_root'
            if (!equal(emitter[key], lastEmitter[key])) {
              emitterUpdatedCA['_root'] = _array.uniq([
                ...(emitterUpdatedCA?.['_root'] || []),
                key,
              ]);
            } else if (emitterUpdatedCA?.['_root']?.includes(key)) {
              // If already exist in push action and having same value then remove from updated push action
              emitterUpdatedCA['_root'] = _array.without(
                emitterUpdatedCA?.['_root'],
                key
              );
            }
          } else if (key === key) {
            for (let updatedKey in emitter[key]) {
              if (
                !equal(emitter[key][updatedKey], emitter?.[key]?.[updatedKey])
              ) {
                emitterUpdatedCA[key] = _array.uniq([
                  ...(emitterUpdatedCA?.[key] || []),
                  updatedKey,
                ]);
              } else if (emitterUpdatedCA?.[key]?.includes(updatedKey)) {
                // If already exist in push action and having same value then remove from updated push action
                emitterUpdatedCA[key] = _array.without(
                  emitterUpdatedCA[key],
                  updatedKey
                );
              }
            }
          }
        }

        if (_object.size(_object.omit(emitterUpdatedCA, ['id']))) {
          if (
            existingEmitterCAIndex !== undefined &&
            existingEmitterCAIndex !== -1
          ) {
            pushAction[pushActionType][existingEmitterCAIndex] =
              emitterUpdatedCA;
          } else {
            pushAction[pushActionType] = [
              ...(pushAction?.[pushActionType] || []),
              emitterUpdatedCA,
            ];
          }
        } else if (pushAction[pushActionType]) {
          pushAction[pushActionType] = pushAction?.[pushActionType].filter(
            (m) => m.id !== emitter_id
          );
        }
      }
    }

    // DELETE
    else {
      // check if in instert and delete both, if true then remove
      if (
        pushAction[EPushActionType.Insert] &&
        pushAction[EPushActionType.Insert]?.includes(emitter_id)
      ) {
        pushAction[EPushActionType.Insert] = _array.without(
          pushAction[EPushActionType.Insert],
          emitter_id
        );
      } else {
        // check if in udpate and delete both, if true then remove
        if (
          pushAction[EPushActionType.Update] &&
          pushAction[EPushActionType.Update]?.find((m) => m.id === emitter_id)
        ) {
          pushAction[EPushActionType.Update] = pushAction[
            EPushActionType.Update
          ].filter((m) => m.id === emitter_id);
        }

        // Add emitter_id in delete
        pushAction[pushActionType] = _array.uniq([
          ...(pushAction?.[pushActionType] || []),
          emitter_id,
        ]);
      }
    }

    // console.log({ pushAction });

    return CleanDeep(pushAction);
  },

  prepareCollectionDirectoriesPushAction: (
    directory_id: TId,
    pushActionType: EPushActionType,
    lastDirectory: IRequestFolder,
    directory: IRequestFolder,
    existingPushAction?: IPushActionDirectory
  ) => {
    let pushAction: IPushActionDirectory = existingPushAction || {};

    // INSERT
    if (pushActionType === EPushActionType.Insert) {
      pushAction[pushActionType] = _array.uniq([
        ...(pushAction[pushActionType] || []),
        directory_id,
      ]);
    }

    // UPDATE
    else if (pushActionType === EPushActionType.Update) {
      if (
        (pushAction[EPushActionType.Insert] &&
          !pushAction[EPushActionType.Insert]?.includes(directory_id)) ||
        !pushAction[EPushActionType.Insert]
      ) {
        // Get existing push action from directory_id
        let existingDirectoryCAIndex = pushAction?.[pushActionType]?.findIndex(
          (d) => d?.id === directory_id
        );

        let directoryUpdatedCA = pushAction?.[pushActionType]?.[
          existingDirectoryCAIndex
        ] || { id: directory_id };

        for (let key in directory) {
          if (key === 'name') {
            // For name and body add in to key '_root'
            if (!equal(directory[key], lastDirectory[key])) {
              directoryUpdatedCA['_root'] = _array.uniq([
                ...(directoryUpdatedCA?.['_root'] || []),
                key,
              ]);
            } else if (directoryUpdatedCA?.['_root']?.includes(key)) {
              // If already exist in push action and having same value then remove from updated push action
              directoryUpdatedCA['_root'] = _array.without(
                directoryUpdatedCA?.['_root'],
                key
              );
            }
          } else if (key === key) {
            for (let updatedKey in directory[key]) {
              if (
                !equal(
                  directory[key][updatedKey],
                  directory?.[key]?.[updatedKey]
                )
              ) {
                directoryUpdatedCA[key] = _array.uniq([
                  ...(directoryUpdatedCA?.[key] || []),
                  updatedKey,
                ]);
              } else if (directoryUpdatedCA?.[key]?.includes(updatedKey)) {
                // If already exist in push action and having same value then remove from updated push action
                directoryUpdatedCA[key] = _array.without(
                  directoryUpdatedCA[key],
                  updatedKey
                );
              }
            }
          }
        }

        if (_object.size(_object.omit(directoryUpdatedCA, ['id']))) {
          if (
            existingDirectoryCAIndex !== undefined &&
            existingDirectoryCAIndex !== -1
          ) {
            pushAction[pushActionType][existingDirectoryCAIndex] =
              directoryUpdatedCA;
          } else {
            pushAction[pushActionType] = [
              ...(pushAction?.[pushActionType] || []),
              directoryUpdatedCA,
            ];
          }
        } else if (pushAction[pushActionType]) {
          pushAction[pushActionType] = pushAction?.[pushActionType].filter(
            (d) => d.id !== directory_id
          );
        }
      }
    }

    // DELETE
    else {
      // check if in instert and delete both, if true then remove
      if (
        pushAction[EPushActionType.Insert] &&
        pushAction[EPushActionType.Insert]?.includes(directory_id)
      ) {
        pushAction[EPushActionType.Insert] = _array.without(
          pushAction[EPushActionType.Insert],
          directory_id
        );
      } else {
        // check if in udpate and delete both, if true then remove
        if (
          pushAction[EPushActionType.Update] &&
          pushAction[EPushActionType.Update]?.find((d) => d.id === directory_id)
        ) {
          pushAction[EPushActionType.Update] = pushAction[
            EPushActionType.Update
          ].filter((d) => d.id === directory_id);
        }

        // Add connectionId in delete
        pushAction[pushActionType] = _array.uniq([
          ...(pushAction?.[pushActionType] || []),
          directory_id,
        ]);
      }
    }

    // console.log({ pushAction });

    return CleanDeep(pushAction);
  },
};

export default PushActionService;

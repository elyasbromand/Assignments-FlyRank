/**
 * @typedef {Object} DecisionNodeData
 * @property {string} prompt
 * @property {string} [label]
 */

/**
 * @typedef {Object} WorkflowNode
 * @property {string} id
 * @property {"decision"|"start"|"end"} type
 * @property {DecisionNodeData} data
 * @property {{x: number, y: number}} position
 */

/**
 * @typedef {Object} WorkflowEdge
 * @property {string} id
 * @property {string} source
 * @property {string} target
 * @property {"yes"|"no"} sourceHandle
 */

export {}; 
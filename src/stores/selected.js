import { writable } from 'svelte/store'

function createSelected() {
	const { subscribe, set } = writable({ row: null, col: null })

	return {
		subscribe,
		set(row, col) {
			set({ row, col })
		},
		clear() {
			set({ row: null, col: null })
		}
	}
}

export const selected = createSelected()

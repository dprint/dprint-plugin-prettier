<style>
  h1{color:red}
</style>

<svelte:options immutable={true}/>

<h1 class="title" on:click={() => count += 1} title={title}>Hello {name}!</h1>
{#if count > 10}
<p>{count} is greater than 10, which is long enough to be wrapped onto another line when it is formatted.</p>
{:else if count > 5}<p>{count} is between 5 and 10</p>
{:else}
  <p>{count} is small</p>
{/if}
{#each items as item, index (item.id)}<Item {...item} name={name} bind:value on:change={e => handle(e, index)} />{/each}
{#await promise}waiting{:then value}{value}{:catch error}{error.message}{/await}

<script lang="ts">
  import Item from './Item.svelte'
  export let name: string = 'world', title = "a"
  let count = 0; $: doubled = count*2
</script>

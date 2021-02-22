import { assertEquals, assertNotEquals } from '../dev_deps.ts';
import { UriMatch, KeyMatch } from './matcher.ts';

const host = 'http://localhost';
Deno.test('UriMatch for basic match', () => {
    const url = new URL('/test', host);
    const matcher = new UriMatch('/test');

    assertNotEquals(
        matcher.getMatch(url),
        null
    );
    
    const match = matcher.getMatch(url);
    assertEquals(
        match?.url.pathname,
        '/test'
    );

    assertEquals(
        match?.uri,
        '/test'
    );
});


Deno.test('KeyMatch key match by typeing', () => {
    const url = new URL('/test/23/sdsd', host);
    const matcher = new KeyMatch('/test/:id/:name', {
        id: {
            type: Number,
        },
        name: {}
    });

    assertNotEquals(
        matcher.getMatch(url),
        null
    );

    const match = matcher.getMatch(url);
    assertEquals(match?.matches?.length, 3);
    assertEquals(match?.params?.get('id'), 23);
    assertEquals(match?.params?.get('name'), 'sdsd');

    assertEquals(
        matcher.getMatch( new URL('/test/sdsd/hallo', host)),
        null
    );

    const match2 = matcher.getMatch( new URL('/test/39448/das-ist-ein-haus_vom', host));

    assertEquals(
        match2?.params?.get('id'),
        39448
    );

    assertEquals(
        matcher.getMatch( new URL('/test/39.448/das', host))?.params?.get('id'),
        39.448
    );
});


Deno.test('KeyMatch should handle optional', () => {
    
})

/** @jest-environment node */

import { prisma } from "@/src/server/db";
import { makeAPICall } from "@/src/__tests__/test-utils";
import { v4 as uuidv4 } from "uuid";

describe("/api/public/generations API Endpoint", () => {
  const pruneDatabase = async () => {
    await prisma.observation.deleteMany();
    await prisma.score.deleteMany();
    await prisma.trace.deleteMany();
  };

  beforeEach(async () => await pruneDatabase());
  afterEach(async () => await pruneDatabase());

  it("should create generation after trace", async () => {
    await pruneDatabase();

    const traceId = uuidv4();

    await makeAPICall("POST", "/api/public/traces", {
      id: traceId,
      name: "trace-name",
      userId: "user-1",
      projectId: "7a88fb47-b4e2-43b8-a06c-a5ce950dc53a",
      metadata: { key: "value" },
      release: "1.0.0",
      version: "2.0.0",
    });

    const dbTrace = await prisma.trace.findMany({
      where: {
        id: traceId,
      },
    });

    expect(dbTrace.length).toBeGreaterThan(0);
    expect(dbTrace[0]?.id).toBe(traceId);

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        traceId: traceId,
        name: "generation-name",
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(traceId);
    expect(dbGeneration?.name).toBe("generation-name");
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });

  it("should create generation before trace", async () => {
    await pruneDatabase();

    const traceId = uuidv4();

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        traceId: traceId,
        name: "generation-name",
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(traceId);
    expect(dbGeneration?.name).toBe("generation-name");
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");

    await makeAPICall("POST", "/api/public/traces", {
      id: traceId,
      name: "trace-name",
      userId: "user-1",
      projectId: "7a88fb47-b4e2-43b8-a06c-a5ce950dc53a",
      metadata: { key: "value" },
      release: "1.0.0",
      version: "2.0.0",
    });

    const dbTrace = await prisma.trace.findMany({
      where: {
        id: traceId,
      },
    });

    expect(dbTrace.length).toBeGreaterThan(0);
    expect(dbTrace[0]?.id).toBe(traceId);
  });

  it("should create generation after trace based on externalId", async () => {
    await pruneDatabase();

    const traceId = uuidv4();

    await makeAPICall("POST", "/api/public/traces", {
      externalId: traceId,
      name: "trace-name",
      userId: "user-1",
      projectId: "7a88fb47-b4e2-43b8-a06c-a5ce950dc53a",
      metadata: { key: "value" },
      release: "1.0.0",
      version: "2.0.0",
    });

    const dbTrace = await prisma.trace.findMany({
      where: {
        externalId: traceId,
      },
    });

    expect(dbTrace.length).toBeGreaterThan(0);
    expect(dbTrace[0]?.externalId).toBe(traceId);
    expect(dbTrace[0]?.id).not.toBe(traceId);

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        traceIdType: "EXTERNAL",
        traceId: traceId,
        name: "generation-name",
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(dbTrace[0]?.id);
    expect(dbGeneration?.name).toBe("generation-name");
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });

  it("should create trace when creating generation without existing trace", async () => {
    const generationName = uuidv4();

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        name: generationName,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    const dbTrace = await prisma.trace.findMany({
      where: {
        name: generationName,
      },
    });

    expect(dbTrace.length).toBe(1);
    expect(dbTrace[0]?.name).toBe(generationName);

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(dbTrace[0]?.id);
    expect(dbGeneration?.name).toBe(generationName);
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });

  it("should create nested generations", async () => {
    const generationName = uuidv4();

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        name: generationName,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);

    const generationId2 = uuidv4();
    const generationName2 = uuidv4();

    const createGeneration2 = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId2,
        name: generationName2,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
        parentObservationId: generationId,
      },
    );
    expect(createGeneration2.status).toBe(200);

    const dbGeneration2 = await prisma.observation.findUnique({
      where: {
        id: generationId2,
      },
    });

    expect(dbGeneration2?.id).toBe(generationId2);
    expect(dbGeneration2?.parentObservationId).toBe(generationId);
  });

  it("should create trace when creating generation without existing trace with externalId", async () => {
    const generationName = uuidv4();

    const generationId = uuidv4();
    const externalTraceId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        traceIdType: "EXTERNAL",
        traceId: externalTraceId,
        name: generationName,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    const dbTrace = await prisma.trace.findMany({
      where: {
        externalId: externalTraceId,
      },
    });

    expect(dbTrace.length).toBe(1);
    expect(dbTrace[0]?.name).toBeNull();

    expect(createGeneration.status).toBe(200);
    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(dbTrace[0]?.id);
    expect(dbGeneration?.name).toBe(generationName);
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });

  it("should create trace when creating generation without existing trace without traceId", async () => {
    const generationName = uuidv4();

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        name: generationName,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    const dbGeneration = await prisma.observation.findFirstOrThrow({
      where: {
        name: generationName,
      },
    });

    const dbTrace = await prisma.trace.findMany({
      where: {
        id: dbGeneration.traceId,
      },
    });

    expect(dbTrace.length).toBe(1);
    expect(dbTrace[0]?.name).toBe(generationName);

    expect(createGeneration.status).toBe(200);

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.traceId).toBe(dbTrace[0]?.id);
    expect(dbGeneration?.name).toBe(generationName);
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });

  it("should update generation", async () => {
    const generationName = uuidv4();

    const generationId = uuidv4();
    const createGeneration = await makeAPICall(
      "POST",
      "/api/public/generations",
      {
        id: generationId,
        name: generationName,
        startTime: "2021-01-01T00:00:00.000Z",
        endTime: "2021-01-01T00:00:00.000Z",
        model: "model-name",
        modelParameters: { key: "value" },
        prompt: { key: "value" },
        metadata: { key: "value" },
        version: "2.0.0",
      },
    );

    expect(createGeneration.status).toBe(200);

    const updateGeneration = await makeAPICall(
      "PATCH",
      "/api/public/generations",
      {
        generationId: generationId,
        completion: "this is a great gpt response",
      },
    );
    expect(updateGeneration.status).toBe(200);

    const dbGeneration = await prisma.observation.findUnique({
      where: {
        id: generationId,
      },
    });

    expect(dbGeneration?.id).toBe(generationId);
    expect(dbGeneration?.name).toBe(generationName);
    expect(dbGeneration?.startTime).toEqual(
      new Date("2021-01-01T00:00:00.000Z"),
    );
    expect(dbGeneration?.endTime).toEqual(new Date("2021-01-01T00:00:00.000Z"));
    expect(dbGeneration?.model).toBe("model-name");
    expect(dbGeneration?.modelParameters).toEqual({ key: "value" });
    expect(dbGeneration?.input).toEqual({ key: "value" });
    expect(dbGeneration?.output).toEqual({
      completion: "this is a great gpt response",
    });
    expect(dbGeneration?.metadata).toEqual({ key: "value" });
    expect(dbGeneration?.version).toBe("2.0.0");
  });
});
